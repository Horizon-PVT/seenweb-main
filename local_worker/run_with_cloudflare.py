import os
import sys
import time
import subprocess
import requests
import uvicorn
import threading
from pathlib import Path

# Configuration
CLOUDFLARED_URL = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
CLOUDFLARED_EXE = "cloudflared.exe"
PORT = 8000

def download_cloudflared():
    """Download cloudflared.exe if not exists"""
    if os.path.exists(CLOUDFLARED_EXE):
        return

    print("Downloading cloudflared.exe (Tunnel)...")
    try:
        response = requests.get(CLOUDFLARED_URL, stream=True)
        response.raise_for_status()
        with open(CLOUDFLARED_EXE, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print("Download complete.")
    except Exception as e:
        print(f"Error downloading cloudflared: {e}")
        sys.exit(1)

def start_tunnel():
    """Start Cloudflare Tunnel and print URL"""
    download_cloudflared()
    
    print(f"\n{'='*60}")
    print("🚀 KHOI DONG CLOUDFLARE TUNNEL (MIEN PHI TRON DOI)...")
    print(f"{'='*60}\n")

    # Start cloudflared
    cmd = [CLOUDFLARED_EXE, "tunnel", "--url", f"http://localhost:{PORT}"]
    process = subprocess.Popen(
        cmd, 
        stdout=subprocess.PIPE, 
        stderr=subprocess.PIPE, 
        text=True,
        encoding='utf-8',
        errors='ignore'
    )

    # Read output to find the URL
    url_found = False
    
    def log_reader(stream):
        nonlocal url_found
        for line in stream:
            line = line.strip()
            if ".trycloudflare.com" in line:
                # Extract URL
                import re
                match = re.search(r'https://[a-zA-Z0-9-]+\.trycloudflare\.com', line)
                if match:
                    url = match.group(0)
                    print(f"\n{'='*60}")
                    print(f"✅ SERVER DA SANS SANG!")
                    print(f"🌍 COPY LINK NAU VAO CAI DAT CUA APP:")
                    print(f"👉 {url}")
                    print(f"{'='*60}\n")
                    url_found = True
            
            # Print errors if suspicious
            if "error" in line.lower() and not url_found:
                print(f"[Tunnel Info] {line}")

    # Start reader threads
    threading.Thread(target=log_reader, args=(process.stderr,), daemon=True).start()
    threading.Thread(target=log_reader, args=(process.stdout,), daemon=True).start()

def start_server():
    # Start Tunnel in background
    threading.Thread(target=start_tunnel, daemon=True).start()
    
    # Start FastAPI
    print(f"🔊 Dang khoi dong TTS Engine tai port {PORT}...")
    
    # Import torch to check GPU
    try:
        import torch
        if torch.cuda.is_available():
            device_name = torch.cuda.get_device_name(0)
            print(f"\n🔥🔥🔥 PHAT HIEN GPU MANH ME: {device_name} 🔥🔥🔥")
            print("=> Toc do tao giong se cuc nhanh!\n")
        else:
            print("\n⚠️  KHONG TIM THAY GPU - CHAY BANG CPU (Se hoi cham)\n")
    except ImportError:
        print("\n⚠️  Khong the kiem tra GPU (thieu thu vien torch)\n")

    uvicorn.run("server:app", host="0.0.0.0", port=PORT, log_level="info")

if __name__ == "__main__":
    start_server()
