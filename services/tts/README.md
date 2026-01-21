# Pocket TTS Server for SeenYT

Đây là TTS server chạy trên Railway, cung cấp API cho SeenYT.

## Features
- Text-to-Speech (nhiều giọng)
- Voice Cloning (5 giây audio mẫu)
- HTTP API

## Deploy to Railway
1. Connect repo này với Railway
2. Set Root Directory: `services/tts`
3. Deploy!

## API Endpoints
- `GET /` - Health check
- `GET /voices` - List available voices
- `POST /generate` - Generate audio from text
- `POST /clone` - Clone voice from audio file
