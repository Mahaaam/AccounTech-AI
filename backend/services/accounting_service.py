from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional
from datetime import datetime, timedelta
import models
import schemas


class AccountingService:
    
    @staticmethod
    def get_trial_balance(db: Session) -> List[schemas.TrialBalanceItem]:
        accounts = db.query(models.Account).filter(models.Account.is_active == True).all()
        
        trial_balance = []
        for account in accounts:
            debit_sum = db.query(func.sum(models.Transaction.amount)).filter(
                and_(
                    models.Transaction.account_id == account.id,
                    models.Transaction.transaction_type == models.TransactionType.DEBIT
                )
            ).scalar() or 0.0
            
            credit_sum = db.query(func.sum(models.Transaction.amount)).filter(
                and_(
                    models.Transaction.account_id == account.id,
                    models.Transaction.transaction_type == models.TransactionType.CREDIT
                )
            ).scalar() or 0.0
            
            balance = debit_sum - credit_sum
            
            trial_balance.append(schemas.TrialBalanceItem(
                account_code=account.code,
                account_name=account.name,
                debit=debit_sum,
                credit=credit_sum,
                balance=balance
            ))
        
        return trial_balance
    
    @staticmethod
    def get_ledger(db: Session, account_id: int, start_date: Optional[datetime] = None, 
                   end_date: Optional[datetime] = None) -> List[schemas.LedgerItem]:
        query = db.query(
            models.Transaction,
            models.JournalEntry
        ).join(
            models.JournalEntry
        ).filter(
            models.Transaction.account_id == account_id
        )
        
        if start_date:
            query = query.filter(models.JournalEntry.date >= start_date)
        if end_date:
            query = query.filter(models.JournalEntry.date <= end_date)
        
        query = query.order_by(models.JournalEntry.date.asc())
        
        results = query.all()
        
        ledger = []
        running_balance = 0.0
        
        for transaction, journal_entry in results:
            if transaction.transaction_type == models.TransactionType.DEBIT:
                debit = transaction.amount
                credit = 0.0
                running_balance += transaction.amount
            else:
                debit = 0.0
                credit = transaction.amount
                running_balance -= transaction.amount
            
            ledger.append(schemas.LedgerItem(
                date=journal_entry.date,
                entry_number=journal_entry.entry_number,
                description=journal_entry.description,
                debit=debit,
                credit=credit,
                balance=running_balance
            ))
        
        return ledger
    
    @staticmethod
    def get_dashboard_stats(db: Session) -> schemas.DashboardStats:
        total_entries = db.query(func.count(models.JournalEntry.id)).scalar()
        total_accounts = db.query(func.count(models.Account.id)).filter(
            models.Account.is_active == True
        ).scalar()
        
        total_debit = db.query(func.sum(models.Transaction.amount)).filter(
            models.Transaction.transaction_type == models.TransactionType.DEBIT
        ).scalar() or 0.0
        
        total_credit = db.query(func.sum(models.Transaction.amount)).filter(
            models.Transaction.transaction_type == models.TransactionType.CREDIT
        ).scalar() or 0.0
        
        recent_entries = db.query(models.JournalEntry).order_by(
            models.JournalEntry.created_at.desc()
        ).limit(10).all()
        
        return schemas.DashboardStats(
            total_entries=total_entries,
            total_accounts=total_accounts,
            total_debit=total_debit,
            total_credit=total_credit,
            balance_difference=total_debit - total_credit,
            recent_entries=[schemas.JournalEntryResponse.from_orm(e) for e in recent_entries]
        )
    
    @staticmethod
    def create_journal_entry_from_voice(db: Session, voice_data: dict, 
                                       voice_text: str) -> models.JournalEntry:
        entry_number = AccountingService._generate_entry_number(db)
        
        journal_entry = models.JournalEntry(
            entry_number=entry_number,
            date=datetime.now(),
            description=voice_data.get('description', voice_text),
            source='voice',
            voice_text=voice_text
        )
        db.add(journal_entry)
        db.flush()
        
        amount = voice_data.get('amount', 0)
        
        if voice_data.get('transaction_type') == 'payment':
            expense_account = AccountingService._get_or_create_account(
                db, voice_data.get('account_name', 'هزینه‌های متفرقه'), models.AccountType.EXPENSE
            )
            cash_account = AccountingService._get_or_create_account(
                db, 'صندوق', models.AccountType.ASSET
            )
            
            db.add(models.Transaction(
                journal_entry_id=journal_entry.id,
                account_id=expense_account.id,
                transaction_type=models.TransactionType.DEBIT,
                amount=amount,
                description=voice_data.get('counterparty')
            ))
            
            db.add(models.Transaction(
                journal_entry_id=journal_entry.id,
                account_id=cash_account.id,
                transaction_type=models.TransactionType.CREDIT,
                amount=amount,
                description=voice_data.get('counterparty')
            ))
        else:
            revenue_account = AccountingService._get_or_create_account(
                db, voice_data.get('account_name', 'درآمدهای متفرقه'), models.AccountType.REVENUE
            )
            cash_account = AccountingService._get_or_create_account(
                db, 'صندوق', models.AccountType.ASSET
            )
            
            db.add(models.Transaction(
                journal_entry_id=journal_entry.id,
                account_id=cash_account.id,
                transaction_type=models.TransactionType.DEBIT,
                amount=amount,
                description=voice_data.get('counterparty')
            ))
            
            db.add(models.Transaction(
                journal_entry_id=journal_entry.id,
                account_id=revenue_account.id,
                transaction_type=models.TransactionType.CREDIT,
                amount=amount,
                description=voice_data.get('counterparty')
            ))
        
        db.commit()
        db.refresh(journal_entry)
        
        return journal_entry
    
    @staticmethod
    def _generate_entry_number(db: Session) -> str:
        last_entry = db.query(models.JournalEntry).order_by(
            models.JournalEntry.id.desc()
        ).first()
        
        if last_entry:
            last_number = int(last_entry.entry_number.split('-')[1])
            new_number = last_number + 1
        else:
            new_number = 1
        
        return f"JE-{new_number:06d}"
    
    @staticmethod
    def _get_or_create_account(db: Session, name: str, 
                               account_type: models.AccountType) -> models.Account:
        account = db.query(models.Account).filter(
            models.Account.name == name
        ).first()
        
        if not account:
            last_account = db.query(models.Account).order_by(
                models.Account.id.desc()
            ).first()
            
            if last_account:
                last_code = int(last_account.code)
                new_code = str(last_code + 1).zfill(4)
            else:
                new_code = "1001"
            
            account = models.Account(
                code=new_code,
                name=name,
                account_type=account_type
            )
            db.add(account)
            db.commit()
            db.refresh(account)
        
        return account
