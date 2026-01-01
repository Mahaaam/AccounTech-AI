from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base
import enum


class AccountType(str, enum.Enum):
    ASSET = "دارایی‌ها"
    LIABILITY = "بدهی‌ها"
    EQUITY = "حقوق صاحبان سهام"
    REVENUE = "درآمدها"
    EXPENSE = "هزینه‌ها"
    DEBTOR = "بدهکاران"
    CREDITOR = "بستانکاران"


class TransactionType(str, enum.Enum):
    DEBIT = "بدهکار"
    CREDIT = "بستانکار"


class Account(Base):
    __tablename__ = "accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, index=True)
    name = Column(String(200), nullable=False)
    account_type = Column(Enum(AccountType), nullable=False)
    parent_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)
    balance = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    parent = relationship("Account", remote_side=[id], backref="children")
    transactions = relationship("Transaction", back_populates="account")


class JournalEntry(Base):
    __tablename__ = "journal_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    entry_number = Column(String(50), unique=True, index=True)
    date = Column(DateTime, nullable=False)
    description = Column(Text, nullable=False)
    reference = Column(String(100), nullable=True)
    source = Column(String(50), default="manual")  # manual, voice, ocr
    voice_text = Column(Text, nullable=True)
    image_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    transactions = relationship("Transaction", back_populates="journal_entry", cascade="all, delete-orphan")


class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    journal_entry_id = Column(Integer, ForeignKey("journal_entries.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    transaction_type = Column(Enum(TransactionType), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    journal_entry = relationship("JournalEntry", back_populates="transactions")
    account = relationship("Account", back_populates="transactions")


class Receipt(Base):
    __tablename__ = "receipts"
    
    id = Column(Integer, primary_key=True, index=True)
    journal_entry_id = Column(Integer, ForeignKey("journal_entries.id"), nullable=True)
    image_path = Column(String(500), nullable=False)
    extracted_text = Column(Text, nullable=True)
    amount = Column(Float, nullable=True)
    date = Column(DateTime, nullable=True)
    vendor = Column(String(200), nullable=True)
    is_processed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class VoiceLog(Base):
    __tablename__ = "voice_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    journal_entry_id = Column(Integer, ForeignKey("journal_entries.id"), nullable=True)
    audio_path = Column(String(500), nullable=True)
    transcribed_text = Column(Text, nullable=False)
    parsed_data = Column(Text, nullable=True)
    is_processed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
