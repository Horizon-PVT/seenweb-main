"""
Pocket TTS Server for SeenYT
FastAPI server providing TTS and Voice Clone APIs
- Supports long text via chunking
- Supports SRT file generation
"""

import os
import io
import re
import uuid
import tempfile
from pathlib import Path
from typing import Optional, List

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import scipy.io.wavfile
import numpy as np
import uvicorn

# Initialize FastAPI
app = FastAPI(
    title="SeenYT TTS Server",
    description="Text-to-Speech and Voice Clone API powered by Pocket TTS",
    version="2.0.0"
)

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model instance
tts_model = None
voice_states = {}

# Available preset voices
PRESET_VOICES = ["alba", "marius", "javert", "jean", "fantine", "cosette", "eponine", "azelma"]

# Max characters per chunk (safe limit for Pocket TTS)
MAX_CHUNK_CHARS = 250

def get_model():
    """Lazy load the TTS model"""
    global tts_model
    if tts_model is None:
        from pocket_tts import TTSModel
        print("Loading TTS model...")
        tts_model = TTSModel.load_model()
        print("TTS model loaded successfully!")
    return tts_model

def get_voice_state(voice: str):
    """Get or create voice state for a voice"""
    global voice_states
    if voice not in voice_states:
        model = get_model()
        voice_states[voice] = model.get_state_for_audio_prompt(voice)
    return voice_states[voice]

def split_text_into_chunks(text: str, max_chars: int = MAX_CHUNK_CHARS) -> List[str]:
    """Split long text into smaller chunks by sentences"""
    # Split by sentence delimiters
    sentences = re.split(r'(?<=[.!?。])\s*', text)
    
    chunks = []
    current_chunk = ""
    
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
            
        if len(sentence) > max_chars:
            # Split by commas for long sentences
            parts = re.split(r'(?<=[,;:])\s*', sentence)
            for part in parts:
                if len(current_chunk) + len(part) + 1 <= max_chars:
                    current_chunk = (current_chunk + " " + part).strip()
                else:
                    if current_chunk:
                        chunks.append(current_chunk)
                    while len(part) > max_chars:
                        chunks.append(part[:max_chars])
                        part = part[max_chars:]
                    current_chunk = part
        elif len(current_chunk) + len(sentence) + 1 <= max_chars:
            current_chunk = (current_chunk + " " + sentence).strip()
        else:
            if current_chunk:
                chunks.append(current_chunk)
            current_chunk = sentence
    
    if current_chunk:
        chunks.append(current_chunk)
    
    return chunks if chunks else [text]

def parse_srt(srt_content: str) -> List[dict]:
    """Parse SRT file content into list of {index, start, end, text}"""
    pattern = re.compile(
        r'(\d+)\s*\n'
        r'(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})\s*\n'
        r'((?:(?!\n\n).)*)',
        re.DOTALL
    )
    
    entries = []
    for match in pattern.finditer(srt_content):
        entries.append({
            "index": int(match.group(1)),
            "start": match.group(2),
            "end": match.group(3),
            "text": match.group(4).replace('\n', ' ').strip()
        })
    
    return entries


@app.get("/")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "SeenYT TTS Server", "version": "2.0.0"}


@app.get("/voices")
async def list_voices():
    """List available preset voices"""
    return {
        "voices": PRESET_VOICES,
        "description": "Use these voice names in the 'voice' parameter"
    }


@app.post("/generate")
async def generate_audio(
    text: str = Form(..., description="Text to convert to speech"),
    voice: str = Form("alba", description="Voice name (preset) or 'custom' if using custom voice"),
    custom_voice_id: Optional[str] = Form(None, description="Custom voice ID from /clone endpoint")
):
    """Generate audio from text using TTS - supports long text via chunking"""
    try:
        model = get_model()
        
        # Determine which voice to use
        if custom_voice_id and custom_voice_id in voice_states:
            voice_state = voice_states[custom_voice_id]
        elif voice in PRESET_VOICES:
            voice_state = get_voice_state(voice)
        else:
            raise HTTPException(status_code=400, detail=f"Invalid voice: {voice}. Available: {PRESET_VOICES}")
        
        # Split text into chunks for long texts
        chunks = split_text_into_chunks(text)
        print(f"Generating audio: {len(chunks)} chunks from {len(text)} chars")
        
        # Generate audio for each chunk
        audio_segments = []
        for i, chunk in enumerate(chunks):
            print(f"  [{i+1}/{len(chunks)}] {chunk[:50]}...")
            chunk_audio = model.generate_audio(voice_state, chunk)
            audio_segments.append(chunk_audio.numpy())
        
        # Concatenate all audio segments
        if len(audio_segments) > 1:
            # Add small silence between chunks (0.2 seconds)
            silence = np.zeros(int(model.sample_rate * 0.2), dtype=audio_segments[0].dtype)
            combined = []
            for i, seg in enumerate(audio_segments):
                combined.append(seg)
                if i < len(audio_segments) - 1:
                    combined.append(silence)
            final_audio = np.concatenate(combined)
        else:
            final_audio = audio_segments[0]
        
        # Convert to WAV bytes
        audio_bytes = io.BytesIO()
        scipy.io.wavfile.write(audio_bytes, model.sample_rate, final_audio)
        audio_bytes.seek(0)
        
        return StreamingResponse(
            audio_bytes,
            media_type="audio/wav",
            headers={"Content-Disposition": f"attachment; filename=tts_output_{uuid.uuid4().hex[:8]}.wav"}
        )
        
    except Exception as e:
        print(f"Generate error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-srt")
async def generate_from_srt(
    srt_file: UploadFile = File(..., description="SRT subtitle file"),
    voice: str = Form("alba", description="Voice name"),
    custom_voice_id: Optional[str] = Form(None, description="Custom voice ID")
):
    """Generate audio from SRT file - combines all subtitle entries into one audio"""
    try:
        # Read and parse SRT file
        content = await srt_file.read()
        srt_text = content.decode('utf-8')
        entries = parse_srt(srt_text)
        
        if not entries:
            raise HTTPException(status_code=400, detail="No valid SRT entries found")
        
        # Combine all text
        full_text = " ".join([entry["text"] for entry in entries])
        print(f"SRT: {len(entries)} entries, {len(full_text)} chars total")
        
        # Generate audio using existing endpoint logic
        model = get_model()
        
        if custom_voice_id and custom_voice_id in voice_states:
            voice_state = voice_states[custom_voice_id]
        elif voice in PRESET_VOICES:
            voice_state = get_voice_state(voice)
        else:
            raise HTTPException(status_code=400, detail=f"Invalid voice: {voice}")
        
        # Split and generate
        chunks = split_text_into_chunks(full_text)
        audio_segments = []
        
        for i, chunk in enumerate(chunks):
            print(f"  SRT [{i+1}/{len(chunks)}] {chunk[:40]}...")
            chunk_audio = model.generate_audio(voice_state, chunk)
            audio_segments.append(chunk_audio.numpy())
        
        # Combine with silence
        if len(audio_segments) > 1:
            silence = np.zeros(int(model.sample_rate * 0.3), dtype=audio_segments[0].dtype)
            combined = []
            for i, seg in enumerate(audio_segments):
                combined.append(seg)
                if i < len(audio_segments) - 1:
                    combined.append(silence)
            final_audio = np.concatenate(combined)
        else:
            final_audio = audio_segments[0]
        
        audio_bytes = io.BytesIO()
        scipy.io.wavfile.write(audio_bytes, model.sample_rate, final_audio)
        audio_bytes.seek(0)
        
        return StreamingResponse(
            audio_bytes,
            media_type="audio/wav",
            headers={"Content-Disposition": f"attachment; filename=srt_audio_{uuid.uuid4().hex[:8]}.wav"}
        )
        
    except Exception as e:
        print(f"SRT generate error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/clone")
async def clone_voice(
    audio_file: UploadFile = File(..., description="WAV file with voice sample (5-10 seconds recommended)"),
    name: Optional[str] = Form(None, description="Optional name for this voice")
):
    """Clone a voice from an audio file"""
    try:
        if not audio_file.filename.lower().endswith(('.wav', '.mp3', '.m4a', '.ogg')):
            raise HTTPException(status_code=400, detail="Please upload a WAV, MP3, M4A, or OGG file")
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            content = await audio_file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        # Sanitize audio file (ensure valid WAV and dimensions)
        try:
            rate, data = scipy.io.wavfile.read(tmp_path)
            # Ensure proper shape/type if needed, or just re-save to normalize headers
            # Converting to mono if stereo might be needed, but let's just re-save for now
            scipy.io.wavfile.write(tmp_path, rate, data)
        except Exception as e:
            # If scipy fails to read, it might be MP3 or invalid. 
            # We continue hoping get_state_for_audio_prompt handles it, or fail there.
            print(f"Sanitization warning: {e}")

        try:
            model = get_model()
            voice_id = f"custom_{uuid.uuid4().hex[:12]}"
            voice_states[voice_id] = model.get_state_for_audio_prompt(tmp_path)
            
            return {
                "voice_id": voice_id,
                "name": name or f"Custom Voice {voice_id[-6:]}",
                "status": "success",
                "message": "Voice cloned successfully!"
            }
        finally:
            os.unlink(tmp_path)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-dialogue")
async def generate_dialogue(
    text: str = Form(..., description="Text with [A] and [B] markers"),
    voice1: str = Form("alba", description="Voice for [A] segments"),
    voice2: str = Form("jean", description="Voice for [B] segments"),
    speed: float = Form(1.0, description="Speed multiplier")
):
    """Generate dialogue audio from text with [A]/[B] markers"""
    try:
        import re
        
        # Parse [A] and [B] markers
        pattern = r'\[(A|B)\]\s*([\s\S]*?)(?=\[[AB]\]|$)'
        matches = re.findall(pattern, text)
        
        if not matches:
            raise HTTPException(status_code=400, detail="No [A] or [B] markers found")
        
        model = get_model()
        audio_segments = []
        
        # Get voice states
        voice1_state = get_voice_state(voice1) if voice1 in PRESET_VOICES or voice1 in voice_states else get_voice_state("alba")
        voice2_state = get_voice_state(voice2) if voice2 in PRESET_VOICES or voice2 in voice_states else get_voice_state("jean")
        
        for speaker, content in matches:
            content = content.strip()
            if not content:
                continue
            
            # Choose voice based on speaker
            voice_state = voice1_state if speaker == 'A' else voice2_state
            
            # Split into chunks if needed
            chunks = split_text_into_chunks(content)
            
            for chunk in chunks:
                print(f"  [{speaker}] {chunk[:40]}...")
                audio = model.generate_audio(voice_state, chunk)
                audio_segments.append(audio.numpy())
            
            # Add pause between speakers (0.3 seconds)
            silence = np.zeros(int(model.sample_rate * 0.3), dtype=audio_segments[0].dtype if audio_segments else np.float32)
            audio_segments.append(silence)
        
        if not audio_segments:
            raise HTTPException(status_code=400, detail="No valid text segments found")
        
        # Concatenate all segments
        final_audio = np.concatenate(audio_segments)
        
        # Convert to WAV bytes
        audio_bytes = io.BytesIO()
        scipy.io.wavfile.write(audio_bytes, model.sample_rate, final_audio)
        audio_bytes.seek(0)
        
        return StreamingResponse(
            audio_bytes,
            media_type="audio/wav",
            headers={"Content-Disposition": f"attachment; filename=dialogue_{uuid.uuid4().hex[:8]}.wav"}
        )
        
    except Exception as e:
        print(f"Dialogue generate error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

