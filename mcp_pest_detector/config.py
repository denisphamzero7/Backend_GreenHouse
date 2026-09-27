import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    # Địa chỉ Backend Nhà Kính (Server_GreenHouse)
    GREENHOUSE_API_URL: str = os.getenv("GREENHOUSE_API_URL", "http://localhost:8088/api")
    
    # Tài khoản Bot Service Account tự động đăng nhập (Hướng 3: Zero hardcode token)
    BOT_EMAIL: str = os.getenv("BOT_EMAIL", "bot_ai@greenhouse.com")
    BOT_PASSWORD: str = os.getenv("BOT_PASSWORD", "AIBotSecretPass2026@")
    
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
