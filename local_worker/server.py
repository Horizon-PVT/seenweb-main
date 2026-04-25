"""
Pocket TTS Server for SeenYT (Async Job Queue Version)
FastAPI server providing TTS and Voice Clone APIs with Asynchronous Background Processing
- Supports long text via chunking
- Supports SRT file generation
- Async Job Queue for Timeout Free generation
"""

import os
import io
import re
import uuid
import tempfile
import time
import threading
import shutil
from pathlib import Path
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse
import scipy.io.wavfile
import numpy as np
import uvicorn

# Initialize FastAPI
app = FastAPI(
    title="SeenYT TTS Server (Async)",
    description="Text-to-Speech API with Async Job Queue",
    version="2.1.0"
)

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- GLOBAL STATE ---
tts_model = None
voice_states = {}
PRESET_VOICES = ["alba", "marius", "javert", "jean", "fantine", "cosette", "eponine", "azelma"]
MAX_CHUNK_CHARS = 250

# Job Storage
# job_id -> { "status": "pending"|"processing"|"completed"|"failed", "progress": 0, "message": "...", "result_file": "path", "created_at": time }
JOBS: Dict[str, Dict[str, Any]] = {}
OUTPUT_DIR = "output_files"

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

# --- MODEL LOADING ---
def get_model():
    """Lazy load the TTS model"""
    global tts_model
    if tts_model is None:
        from pocket_tts import TTSModel
        print("Loading TTS model...")
        tts_model = TTSModel.load_model()
        print("TTS model loaded successfully!")
    return tts_model

def load_saved_voices():
    """Load saved custom voices from disk"""
    global voice_states
    voices_dir = "voices"
    if not os.path.exists(voices_dir):
        os.makedirs(voices_dir)
    
    print("Loading saved voices...")
    model = get_model()
    for filename in os.listdir(voices_dir):
        if filename.endswith(".wav"):
            voice_id = filename[:-4] # Remove .wav
            path = os.path.join(voices_dir, filename)
            try:
                voice_states[voice_id] = model.get_state_for_audio_prompt(path)
                print(f"Loaded voice: {voice_id}")
            except Exception as e:
                print(f"Failed to load {filename}: {e}")

def get_voice_state(voice: str):
    """Get or create voice state for a voice"""
    global voice_states
    if voice not in voice_states:
        model = get_model()
        voice_states[voice] = model.get_state_for_audio_prompt(voice)
    return voice_states[voice]

# --- UTILS ---
def split_text_into_chunks(text: str, max_chars: int = MAX_CHUNK_CHARS) -> List[str]:
    """Split long text into smaller chunks by sentences"""
    sentences = re.split(r'(?<=[.!?。])\s*', text)
    chunks = []
    current_chunk = ""
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence: continue
        if len(sentence) > max_chars:
            parts = re.split(r'(?<=[,;:])\s*', sentence)
            for part in parts:
                if len(current_chunk) + len(part) + 1 <= max_chars:
                    current_chunk = (current_chunk + " " + part).strip()
                else:
                    if current_chunk: chunks.append(current_chunk)
                    while len(part) > max_chars:
                        chunks.append(part[:max_chars])
                        part = part[max_chars:]
                    current_chunk = part
        elif len(current_chunk) + len(sentence) + 1 <= max_chars:
            current_chunk = (current_chunk + " " + sentence).strip()
        else:
            if current_chunk: chunks.append(current_chunk)
            current_chunk = sentence
    if current_chunk: chunks.append(current_chunk)
    return chunks if chunks else [text]

def parse_srt(srt_content: str) -> List[dict]:
    """Parse SRT file content into list of {index, start, end, text}"""
    # Normalize line endings (Windows CRLF -> Unix LF)
    srt_content = srt_content.replace('\r\n', '\n').replace('\r', '\n')
    
    pattern = re.compile(
        r'(\d+)\s*\n'
        r'(\d{2}:\d{2}:\d{2}[,\.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,\.]\d{3})\s*\n'
        r'((?:(?!\n\n).)*)',
        re.DOTALL
    )
    
    entries = []
    for match in pattern.finditer(srt_content):
        text = match.group(4).replace('\n', ' ').strip()
        if not text:
            continue
        entries.append({
            "index": int(match.group(1)),
            "start": match.group(2).replace('.', ','),
            "end": match.group(3).replace('.', ','),
            "text": text
        })
    
    return entries

def timestamp_to_seconds(ts):
    h, m, s_ms = ts.split(':')
    s, ms = s_ms.split(',')
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000.0

def process_srt_job(job_id: str, srt_content: str, voice: str, custom_voice_id: str):
    try:
        JOBS[job_id]["status"] = "processing"
        JOBS[job_id]["progress"] = 5
        JOBS[job_id]["message"] = "Parsing SRT..."
        
        entries = parse_srt(srt_content)
        if not entries:
            raise Exception("No valid SRT entries found")
            
        model = get_model()
        
        # Determine voice
        if custom_voice_id and custom_voice_id in voice_states:
            voice_state = voice_states[custom_voice_id]
        elif voice in PRESET_VOICES:
            voice_state = get_voice_state(voice)
        else:
            raise Exception(f"Invalid voice: {voice}")

        audio_segments = []
        current_time_sec = 0.0
        sample_rate = model.sample_rate
        last_end_sec = 0.0
        
        total_entries = len(entries)
        
        for i, entry in enumerate(entries):
            start_sec = timestamp_to_seconds(entry["start"])
            end_sec = timestamp_to_seconds(entry["end"])
            text = entry["text"]
            last_end_sec = max(last_end_sec, end_sec)
            
            # Progress Update
            progress = 5 + int((i + 1) / total_entries * 85)
            JOBS[job_id]["progress"] = progress
            JOBS[job_id]["message"] = f"Processing line {i+1}/{total_entries}..."

            # 1. Add leading silence
            gap_to_start = start_sec - current_time_sec
            if gap_to_start > 0.01:
                silence_samples = int(gap_to_start * sample_rate)
                audio_segments.append(np.zeros(silence_samples, dtype=np.float32))
                current_time_sec = start_sec
            
            # 2. Generate Audio
            chunk_audio = model.generate_audio(voice_state, text)
            chunk_numpy = chunk_audio.numpy()
            audio_segments.append(chunk_numpy)
            
            audio_duration = len(chunk_numpy) / sample_rate
            current_time_sec += audio_duration
            
            # 3. Add padding if TTS finished before END time
            if current_time_sec < end_sec:
                padding = end_sec - current_time_sec
                if padding > 0.01:
                    padding_samples = int(padding * sample_rate)
                    audio_segments.append(np.zeros(padding_samples, dtype=np.float32))
                    current_time_sec = end_sec
        
        # 4. Trailing silence
        if current_time_sec < last_end_sec:
            trailing = last_end_sec - current_time_sec
            if trailing > 0.01:
                audio_segments.append(np.zeros(int(trailing * sample_rate), dtype=np.float32))

        # Save
        JOBS[job_id]["message"] = "Saving file..."
        if audio_segments:
            final_audio = np.concatenate(audio_segments)
            filename = f"srt_{job_id}.wav"
            filepath = os.path.join(OUTPUT_DIR, filename)
            scipy.io.wavfile.write(filepath, model.sample_rate, final_audio)
            
            JOBS[job_id]["status"] = "completed"
            JOBS[job_id]["progress"] = 100
            JOBS[job_id]["message"] = "Done!"
            JOBS[job_id]["result_file"] = filepath
        else:
            raise Exception("No audio generated")
            
    except Exception as e:
        print(f"[Job {job_id}] SRT Failed: {e}")
        JOBS[job_id]["status"] = "failed"
        JOBS[job_id]["error"] = str(e)
    current_time = time.time()
    for job_id, job in list(JOBS.items()):
        if current_time - job["created_at"] > 3600: # 1 hour
            if "result_file" in job and job["result_file"] and os.path.exists(job["result_file"]):
                try:
                    os.remove(job["result_file"])
                    print(f"Cleaned up {job['result_file']}")
                except:
                    pass
            del JOBS[job_id]

# --- BACKGROUND TASKS ---

def process_tts_job(job_id: str, text: str, voice: str, custom_voice_id: str):
    try:
        JOBS[job_id]["status"] = "processing"
        JOBS[job_id]["progress"] = 5
        JOBS[job_id]["message"] = "Starting TTS..."
        
        model = get_model()
        
        # Determine voice
        if custom_voice_id and custom_voice_id in voice_states:
            voice_state = voice_states[custom_voice_id]
        elif voice in PRESET_VOICES:
            voice_state = get_voice_state(voice)
        else:
            raise Exception(f"Invalid voice: {voice}")

        # Split chunks
        chunks = split_text_into_chunks(text)
        total_chunks = len(chunks)
        JOBS[job_id]["message"] = f"Generating {total_chunks} chunks..."
        print(f"[Job {job_id}] generating {total_chunks} chunks")

        audio_segments = []
        for i, chunk in enumerate(chunks):
            chunk_audio = model.generate_audio(voice_state, chunk)
            audio_segments.append(chunk_audio.numpy())
            
            # Update progress (5% to 90%)
            progress = 5 + int((i + 1) / total_chunks * 85)
            JOBS[job_id]["progress"] = progress
            JOBS[job_id]["message"] = f"Chunk {i+1}/{total_chunks}..."

        # Concatenate
        JOBS[job_id]["message"] = "Finalizing audio..."
        if len(audio_segments) > 1:
            silence = np.zeros(int(model.sample_rate * 0.2), dtype=audio_segments[0].dtype)
            combined = []
            for i, seg in enumerate(audio_segments):
                combined.append(seg)
                if i < len(audio_segments) - 1:
                    combined.append(silence)
            final_audio = np.concatenate(combined)
        else:
            final_audio = audio_segments[0]
        
        # Save to file
        filename = f"{job_id}.wav"
        filepath = os.path.join(OUTPUT_DIR, filename)
        scipy.io.wavfile.write(filepath, model.sample_rate, final_audio)
        
        JOBS[job_id]["status"] = "completed"
        JOBS[job_id]["progress"] = 100
        JOBS[job_id]["message"] = "Done!"
        JOBS[job_id]["result_file"] = filepath
        print(f"[Job {job_id}] Completed successfully")
        
    except Exception as e:
        print(f"[Job {job_id}] Failed: {e}")
        JOBS[job_id]["status"] = "failed"
        JOBS[job_id]["error"] = str(e)


def process_dialogue_job(job_id: str, text: str, voice1: str, voice2: str):
    try:
        JOBS[job_id]["status"] = "processing"
        JOBS[job_id]["progress"] = 5
        JOBS[job_id]["message"] = "Parsing dialogue..."
        
        model = get_model()
        
        # Parse dialogue
        pattern = r'\[(A|B)\]\s*([\s\S]*?)(?=\[[AB]\]|$)'
        matches = re.findall(pattern, text)
        if not matches:
            raise Exception("No [A] or [B] markers found")

        # Get voice states
        v1_state = get_voice_state(voice1) if voice1 in PRESET_VOICES or voice1 in voice_states else get_voice_state("alba")
        v2_state = get_voice_state(voice2) if voice2 in PRESET_VOICES or voice2 in voice_states else get_voice_state("jean")
        
        audio_segments = []
        total_segments = len(matches)
        
        for i, (speaker, content) in enumerate(matches):
            content = content.strip()
            if not content: continue
            
            # Update progress
            progress = 5 + int((i + 1) / total_segments * 85)
            JOBS[job_id]["progress"] = progress
            JOBS[job_id]["message"] = f"Generating line {i+1} ({speaker})..."
            
            voice_state = v1_state if speaker == 'A' else v2_state
            
            chunks = split_text_into_chunks(content)
            for chunk in chunks:
                audio = model.generate_audio(voice_state, chunk)
                audio_segments.append(audio.numpy())
            
            # Pause between speakers
            silence = np.zeros(int(model.sample_rate * 0.3), dtype=np.float32)
            audio_segments.append(silence)
            
        # Cat and Save
        JOBS[job_id]["message"] = "Saving file..."
        if audio_segments:
            final_audio = np.concatenate(audio_segments)
            filename = f"dialogue_{job_id}.wav"
            filepath = os.path.join(OUTPUT_DIR, filename)
            scipy.io.wavfile.write(filepath, model.sample_rate, final_audio)
            
            JOBS[job_id]["status"] = "completed"
            JOBS[job_id]["progress"] = 100
            JOBS[job_id]["message"] = "Done!"
            JOBS[job_id]["result_file"] = filepath
        else:
            raise Exception("No audio generated")
            
    except Exception as e:
        print(f"[Job {job_id}] Failed: {e}")
        JOBS[job_id]["status"] = "failed"
        JOBS[job_id]["error"] = str(e)


# --- ENDPOINTS ---

@app.on_event("startup")
async def startup_event():
    get_model()
    load_saved_voices()
    # Start cleanup background task if needed, or just run on request

@app.get("/")
async def health_check():
    return {"status": "ok", "mode": "async_job_queue", "gpu": True}

@app.get("/voices")
async def list_voices():
    custom_voice_ids = [vid for vid in voice_states.keys() if vid.startswith("custom_")]
    return {
        "voices": PRESET_VOICES,
        "custom_voices": custom_voice_ids
    }

# NEW: Job Submission endpoint
@app.post("/job/submit")
async def submit_job(
    background_tasks: BackgroundTasks,
    type: str = Form(..., description="tts or dialogue"),
    text: str = Form(...),
    voice: Optional[str] = Form("alba"),
    custom_voice_id: Optional[str] = Form(None),
    voice2: Optional[str] = Form(None), # For dialogue
):
    job_id = str(uuid.uuid4())
    JOBS[job_id] = {
        "job_id": job_id,
        "status": "pending",
        "progress": 0,
        "message": "Queued...",
        "created_at": time.time()
    }
    
    if type == "tts":
        background_tasks.add_task(process_tts_job, job_id, text, voice, custom_voice_id)
    elif type == "dialogue":
        background_tasks.add_task(process_dialogue_job, job_id, text, voice, voice2) # voice=v1, voice2=v2
    elif type == "srt":
        background_tasks.add_task(process_srt_job, job_id, text, voice, custom_voice_id) # text here is srt content
    else:
        raise HTTPException(status_code=400, detail="Invalid job type")
        
    return {"job_id": job_id, "status": "queued"}

# NEW: Job Status endpoint
@app.get("/job/{job_id}")
async def get_job_status(job_id: str):
    if job_id not in JOBS:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = JOBS[job_id]
    return {
        "job_id": job_id,
        "status": job["status"],
        "progress": job.get("progress", 0),
        "message": job.get("message", ""),
        "error": job.get("error", None)
    }

# NEW: Job Download endpoint
@app.get("/job/{job_id}/download")
async def download_job_result(job_id: str):
    if job_id not in JOBS:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = JOBS[job_id]
    if job["status"] != "completed" or "result_file" not in job:
        raise HTTPException(status_code=400, detail="Job not ready or failed")
        
    return FileResponse(
        job["result_file"],
        media_type="audio/wav",
        filename=os.path.basename(job["result_file"])
    )

@app.post("/clone")
async def clone_voice(
    audio_file: UploadFile = File(...),
    name: Optional[str] = Form(None)
):
    # Keep synchronous for now as it's usually short (or make async if needed)
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp.write(await audio_file.read())
            tmp_path = tmp.name
        
        # Simple sanitize
        try:
            rate, data = scipy.io.wavfile.read(tmp_path)
            scipy.io.wavfile.write(tmp_path, rate, data)
        except: pass

        model = get_model()
        voice_id = f"custom_{uuid.uuid4().hex[:12]}"
        save_path = f"voices/{voice_id}.wav"
        if not os.path.exists("voices"): os.makedirs("voices")
        shutil.move(tmp_path, save_path)
        
        voice_states[voice_id] = model.get_state_for_audio_prompt(save_path)
        return {"voice_id": voice_id, "name": name, "status": "success"}
    except Exception as e:
        raise HTTPException(500, detail=str(e))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting Async TTS Server on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)

