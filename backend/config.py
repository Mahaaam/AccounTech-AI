from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./accounting.db"
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # OCR
    TESSERACT_PATH: Optional[str] = None
    OCR_LANGUAGE: str = "fas+eng"
    
    # Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB
    
    # Backup
    BACKUP_DIR: str = "./backups"
    AUTO_BACKUP: bool = True
    BACKUP_INTERVAL_HOURS: int = 24
    
    class Config:
        env_file = ".env"


settings = Settings()
