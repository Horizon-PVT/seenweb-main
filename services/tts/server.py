"""
Pocket TTS Server for SeenYT
FastAPI server providing TTS and Voice Clone APIs
"""

import os
import io
import uuid
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import scipy.io.wavfile
import uvicorn

# Initialize FastAPI
app = FastAPI(
    title="SeenYT TTS Server",
    description="Text-to-Speech and Voice Clone API powered by Pocket TTS",
    version="1.0.0"
)

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to seenyt.net
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model instance (loaded once)
tts_model = None
voice_states = {}

# Available preset voices
PRESET_VOICES = ["alba", "marius", "javert", "jean", "fantine", "cosette", "eponine", "azelma"]

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


@app.get("/")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "SeenYT TTS Server", "version": "1.0.0"}


@app.get("/voices")
async def list_voices():
    """List available preset voices"""
    return {
        "voices": PRESET_VOICES,
        "description": "Use these voice names in the 'voice' parameter, or upload your own WAV file for voice cloning"
    }


@app.post("/generate")
async def generate_audio(
    text: str = Form(..., description="Text to convert to speech"),
    voice: str = Form("alba", description="Voice name (preset) or 'custom' if using custom voice"),
    custom_voice_id: Optional[str] = Form(None, description="Custom voice ID from /clone endpoint")
):
    """Generate audio from text using TTS"""
    try:
        model = get_model()
        
        # Determine which voice to use
        if custom_voice_id and custom_voice_id in voice_states:
            voice_state = voice_states[custom_voice_id]
        elif voice in PRESET_VOICES:
            voice_state = get_voice_state(voice)
        else:
            raise HTTPException(status_code=400, detail=f"Invalid voice: {voice}. Available: {PRESET_VOICES}")
        
        # Generate audio
        audio = model.generate_audio(voice_state, text)
        
        # Convert to WAV bytes
        audio_bytes = io.BytesIO()
        scipy.io.wavfile.write(audio_bytes, model.sample_rate, audio.numpy())
        audio_bytes.seek(0)
        
        # Return as streaming response
        return StreamingResponse(
            audio_bytes,
            media_type="audio/wav",
            headers={"Content-Disposition": f"attachment; filename=tts_output_{uuid.uuid4().hex[:8]}.wav"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/clone")
async def clone_voice(
    audio_file: UploadFile = File(..., description="WAV file with voice sample (5-10 seconds recommended)"),
    name: Optional[str] = Form(None, description="Optional name for this voice")
):
    """Clone a voice from an audio file"""
    try:
        # Validate file type
        if not audio_file.filename.endswith(('.wav', '.mp3', '.m4a', '.ogg')):
            raise HTTPException(status_code=400, detail="Please upload a WAV, MP3, M4A, or OGG file")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            content = await audio_file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        try:
            # Load model and create voice state from audio
            model = get_model()
            voice_id = f"custom_{uuid.uuid4().hex[:12]}"
            voice_states[voice_id] = model.get_state_for_audio_prompt(tmp_path)
            
            return {
                "voice_id": voice_id,
                "name": name or f"Custom Voice {voice_id[-6:]}",
                "status": "success",
                "message": "Voice cloned successfully! Use this voice_id in /generate endpoint"
            }
        finally:
            # Cleanup temp file
            os.unlink(tmp_path)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-stream")
async def generate_audio_stream(
    text: str = Form(...),
    voice: str = Form("alba")
):
    """Generate audio with streaming (for long text)"""
    # TODO: Implement streaming for very long texts
    return await generate_audio(text=text, voice=voice)


if __name__ == "__main__":
    # Preload model on startup - REMOVED to save RAM on startup
    # get_model()
    
    # Run server
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
