import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    GREENHOUSE_API_URL: str = os.getenv("GREENHOUSE_API_URL", "http://localhost:8080/api")
    ADMIN_ACCESS_TOKEN: str = os.getenv("ADMIN_ACCESS_TOKEN", "")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
