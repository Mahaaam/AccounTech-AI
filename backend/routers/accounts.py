from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import get_db

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.post("/", response_model=schemas.AccountResponse)
def create_account(account: schemas.AccountCreate, db: Session = Depends(get_db)):
    """Create a new account with auto-generated code"""
    # Auto-generate code based on parent and type
    if account.parent_id:
        parent = db.query(models.Account).filter(models.Account.id == account.parent_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent account not found")
        
        # Get siblings to find next code
        siblings = db.query(models.Account).filter(models.Account.parent_id == account.parent_id).all()
        if siblings:
            max_code = max([int(s.code) for s in siblings if s.code.isdigit()], default=int(parent.code) * 10)
            new_code = str(max_code + 1)
        else:
            new_code = str(int(parent.code) * 10 + 1)
    else:
        # Main account - find next available main code
        main_accounts = db.query(models.Account).filter(models.Account.parent_id == None).all()
        if main_accounts:
            max_code = max([int(a.code) for a in main_accounts if a.code.isdigit()], default=0)
            new_code = str(max_code + 1)
        else:
            new_code = "1"
    
    # Create account with auto-generated code
    account_data = account.dict()
    account_data['code'] = new_code
    db_account = models.Account(**account_data)
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account


@router.get("/", response_model=List[schemas.AccountResponse])
def get_accounts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    accounts = db.query(models.Account).filter(
        models.Account.is_active == True
    ).offset(skip).limit(limit).all()
    
    return accounts


@router.get("/{account_id}", response_model=schemas.AccountResponse)
def get_account(account_id: int, db: Session = Depends(get_db)):
    account = db.query(models.Account).filter(models.Account.id == account_id).first()
    
    if not account:
        raise HTTPException(status_code=404, detail="حساب یافت نشد")
    
    return account


@router.put("/{account_id}", response_model=schemas.AccountResponse)
def update_account(account_id: int, account: schemas.AccountUpdate, 
                   db: Session = Depends(get_db)):
    db_account = db.query(models.Account).filter(models.Account.id == account_id).first()
    
    if not db_account:
        raise HTTPException(status_code=404, detail="حساب یافت نشد")
    
    for key, value in account.dict(exclude_unset=True).items():
        setattr(db_account, key, value)
    
    db.commit()
    db.refresh(db_account)
    
    return db_account


@router.delete("/{account_id}")
def delete_account(account_id: int, db: Session = Depends(get_db)):
    db_account = db.query(models.Account).filter(models.Account.id == account_id).first()
    
    if not db_account:
        raise HTTPException(status_code=404, detail="حساب یافت نشد")
    
    db_account.is_active = False
    db.commit()
    
    return {"message": "حساب با موفقیت غیرفعال شد"}
