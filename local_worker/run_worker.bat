@echo off
echo Dang khoi dong Server Worker...
call venv\Scripts\activate

echo Kiem tra GPU...
python -c "import torch; print('GPU Available:', torch.cuda.is_available()); print('Device Name:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'None')"

echo.
echo Bat dau Server tai http://localhost:8000
echo (Giu cua so nay luon mo khi muon tao giong)
echo.

python run_with_cloudflare.py
