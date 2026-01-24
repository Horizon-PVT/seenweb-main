import os
import sys
import uvicorn
from pyngrok import ngrok, conf
from dotenv import load_dotenv

# Load env if needed
load_dotenv()

def start_server():
    port = 8000
    
    # Configure Ngrok with User Token
    token = "36mP0YYHE9WoZlvPueQrywrxLoX_3RUEey7H9T2TPbvWiddjU"
    ngrok.set_auth_token(token)
    
    try:
        # Open a Ngrok tunnel to the port
        public_url = ngrok.connect(port).public_url
        print("\n" + "="*60)
        print(f"🌍 WEB CUA ANH TREN VERCEL CAN KET NOI DEN URL NAY:")
        print(f"👉 {public_url}")
        print("="*60 + "\n")
        
        # Update .env automatically? Or just instruct user.
        # For local dev, we can update .env.local?
        # But user wants Vercel.
        
    except Exception as e:
        print(f"Ngrok Warning: {e}")
        print("Hay dam bao ban da login Ngrok hoac mang on dinh.")

    # Start FastAPI
    print(f"🚀 Dang chay Server Local tai port {port}...")
    uvicorn.run("server:app", host="0.0.0.0", port=port, log_level="info")

if __name__ == "__main__":
    start_server()
