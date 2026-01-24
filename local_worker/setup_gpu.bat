@echo off
echo ===================================================
echo   CAI DAT MOI TRUONG WORKER GPU (SEENWEB)
echo ===================================================

echo 1. Tao moi truong ao Python (venv)...
python -m venv venv
call venv\Scripts\activate

echo.
echo 2. Cai dat PyTorch (Phien ban ho tro GPU NVIDIA)...
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

echo.
echo 3. Cai dat thu vien PocketTTS, FastAPI va Ngrok...
pip install pocket-tts>=0.4.0 fastapi uvicorn python-multipart scipy numpy aiofiles pyngrok python-dotenv

echo.
echo ===================================================
echo   CAI DAT HOAN TAT!
echo   Hay chay file "run_worker.bat" de bat server.
echo ===================================================
pause
