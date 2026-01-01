from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import Account
import hashlib
import os

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBasic()

# Simple password storage (in production, use proper user management)
PASSWORD_FILE = "app_password.txt"
DEFAULT_PASSWORD = "admin"

def get_password_hash(password: str) -> str:
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password"""
    return get_password_hash(plain_password) == hashed_password

def get_stored_password() -> str:
    """Get stored password hash"""
    if os.path.exists(PASSWORD_FILE):
        with open(PASSWORD_FILE, 'r') as f:
            return f.read().strip()
    else:
        # Create default password
        default_hash = get_password_hash(DEFAULT_PASSWORD)
        with open(PASSWORD_FILE, 'w') as f:
            f.write(default_hash)
        return default_hash

def save_password(password_hash: str):
    """Save password hash"""
    with open(PASSWORD_FILE, 'w') as f:
        f.write(password_hash)

class LoginRequest(BaseModel):
    password: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

class LoginResponse(BaseModel):
    success: bool
    message: str

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest):
    """Login with password"""
    stored_hash = get_stored_password()
    if verify_password(request.password, stored_hash):
        return LoginResponse(success=True, message="ورود موفقیت‌آمیز")
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="رمز عبور اشتباه است"
        )

@router.post("/change-password", response_model=LoginResponse)
def change_password(request: ChangePasswordRequest):
    """Change password"""
    stored_hash = get_stored_password()
    
    # Verify old password
    if not verify_password(request.old_password, stored_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="رمز عبور فعلی اشتباه است"
        )
    
    # Save new password
    new_hash = get_password_hash(request.new_password)
    save_password(new_hash)
    
    return LoginResponse(success=True, message="رمز عبور با موفقیت تغییر کرد")

@router.get("/check")
def check_auth():
    """Check if password is set"""
    return {
        "password_set": os.path.exists(PASSWORD_FILE),
        "default_password": "admin" if not os.path.exists(PASSWORD_FILE) else None
    }
