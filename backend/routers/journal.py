from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import models
import schemas
from database import get_db
from services.accounting_service import AccountingService

router = APIRouter(prefix="/journal", tags=["journal"])


@router.post("/", response_model=schemas.JournalEntryResponse)
def create_journal_entry(entry: schemas.JournalEntryCreate, db: Session = Depends(get_db)):
    entry_number = AccountingService._generate_entry_number(db)
    
    journal_entry = models.JournalEntry(
        entry_number=entry_number,
        date=entry.date,
        description=entry.description,
        reference=entry.reference,
        source=entry.source,
        voice_text=entry.voice_text
    )
    db.add(journal_entry)
    db.flush()
    
    total_debit = 0.0
    total_credit = 0.0
    
    for trans in entry.transactions:
        transaction = models.Transaction(
            journal_entry_id=journal_entry.id,
            account_id=trans.account_id,
            transaction_type=trans.transaction_type,
            amount=trans.amount,
            description=trans.description
        )
        db.add(transaction)
        
        if trans.transaction_type == models.TransactionType.DEBIT:
            total_debit += trans.amount
        else:
            total_credit += trans.amount
    
    if abs(total_debit - total_credit) > 0.01:
        raise HTTPException(
            status_code=400, 
            detail=f"سند متوازن نیست. بدهکار: {total_debit}, بستانکار: {total_credit}"
        )
    
    db.commit()
    db.refresh(journal_entry)
    
    return journal_entry


@router.get("/", response_model=List[schemas.JournalEntryResponse])
def get_journal_entries(
    skip: int = 0, 
    limit: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.JournalEntry)
    
    if start_date:
        query = query.filter(models.JournalEntry.date >= start_date)
    if end_date:
        query = query.filter(models.JournalEntry.date <= end_date)
    
    entries = query.order_by(models.JournalEntry.date.desc()).offset(skip).limit(limit).all()
    
    return entries


@router.get("/{entry_id}", response_model=schemas.JournalEntryResponse)
def get_journal_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(models.JournalEntry).filter(models.JournalEntry.id == entry_id).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="سند یافت نشد")
    
    return entry


@router.put("/{entry_id}", response_model=schemas.JournalEntryResponse)
def update_journal_entry(entry_id: int, entry: schemas.JournalEntryCreate, 
                        db: Session = Depends(get_db)):
    db_entry = db.query(models.JournalEntry).filter(models.JournalEntry.id == entry_id).first()
    
    if not db_entry:
        raise HTTPException(status_code=404, detail="سند یافت نشد")
    
    db.query(models.Transaction).filter(
        models.Transaction.journal_entry_id == entry_id
    ).delete()
    
    db_entry.date = entry.date
    db_entry.description = entry.description
    db_entry.reference = entry.reference
    
    total_debit = 0.0
    total_credit = 0.0
    
    for trans in entry.transactions:
        transaction = models.Transaction(
            journal_entry_id=db_entry.id,
            account_id=trans.account_id,
            transaction_type=trans.transaction_type,
            amount=trans.amount,
            description=trans.description
        )
        db.add(transaction)
        
        if trans.transaction_type == models.TransactionType.DEBIT:
            total_debit += trans.amount
        else:
            total_credit += trans.amount
    
    if abs(total_debit - total_credit) > 0.01:
        raise HTTPException(
            status_code=400, 
            detail=f"سند متوازن نیست. بدهکار: {total_debit}, بستانکار: {total_credit}"
        )
    
    db.commit()
    db.refresh(db_entry)
    
    return db_entry


@router.delete("/{entry_id}")
def delete_journal_entry(entry_id: int, db: Session = Depends(get_db)):
    db_entry = db.query(models.JournalEntry).filter(models.JournalEntry.id == entry_id).first()
    
    if not db_entry:
        raise HTTPException(status_code=404, detail="سند یافت نشد")
    
    db.delete(db_entry)
    db.commit()
    
    return {"message": "سند با موفقیت حذف شد"}
