from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from models import AccountType, TransactionType


class AccountBase(BaseModel):
    code: str
    name: str
    account_type: AccountType
    parent_id: Optional[int] = None


class AccountCreate(BaseModel):
    name: str
    account_type: AccountType
    parent_id: Optional[int] = None


class AccountUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None


class AccountResponse(AccountBase):
    id: int
    balance: float
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class TransactionBase(BaseModel):
    account_id: int
    transaction_type: TransactionType
    amount: float
    description: Optional[str] = None


class TransactionCreate(TransactionBase):
    pass


class TransactionResponse(TransactionBase):
    id: int
    journal_entry_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class JournalEntryBase(BaseModel):
    date: datetime
    description: str
    reference: Optional[str] = None


class JournalEntryCreate(JournalEntryBase):
    transactions: List[TransactionCreate]
    source: str = "manual"
    voice_text: Optional[str] = None


class JournalEntryResponse(JournalEntryBase):
    id: int
    entry_number: str
    source: str
    created_at: datetime
    transactions: List[TransactionResponse]
    
    class Config:
        from_attributes = True


class VoiceInput(BaseModel):
    text: str


class VoiceResponse(BaseModel):
    success: bool
    message: str
    parsed_data: Optional[dict] = None
    journal_entry_id: Optional[int] = None


class OCRResponse(BaseModel):
    success: bool
    message: str
    extracted_text: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[str] = None
    vendor: Optional[str] = None


class TrialBalanceItem(BaseModel):
    account_code: str
    account_name: str
    debit: float
    credit: float
    balance: float


class LedgerItem(BaseModel):
    date: datetime
    entry_number: str
    description: str
    debit: float
    credit: float
    balance: float


class DashboardStats(BaseModel):
    total_entries: int
    total_accounts: int
    total_debit: float
    total_credit: float
    balance_difference: float
    recent_entries: List[JournalEntryResponse]
