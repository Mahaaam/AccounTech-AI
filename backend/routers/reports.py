from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import schemas
from database import get_db
from services.accounting_service import AccountingService

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/trial-balance", response_model=List[schemas.TrialBalanceItem])
def get_trial_balance(db: Session = Depends(get_db)):
    return AccountingService.get_trial_balance(db)


@router.get("/ledger/{account_id}", response_model=List[schemas.LedgerItem])
def get_ledger(
    account_id: int,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    return AccountingService.get_ledger(db, account_id, start_date, end_date)


@router.get("/dashboard", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    return AccountingService.get_dashboard_stats(db)
