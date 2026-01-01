from database import engine, SessionLocal, Base
from models import Account, AccountType

def init_database():
    """Initialize database and create default accounts with hierarchy"""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if accounts already exist
        existing_accounts = db.query(Account).count()
        if existing_accounts > 0:
            print("Database already initialized with accounts")
            return
        
        # Create main account categories (سرفصل‌های اصلی)
        main_accounts = {
            'asset': Account(code="1", name="دارایی‌ها", account_type=AccountType.ASSET),
            'liability': Account(code="2", name="بدهی‌ها", account_type=AccountType.LIABILITY),
            'equity': Account(code="3", name="حقوق صاحبان سهام", account_type=AccountType.EQUITY),
            'revenue': Account(code="4", name="درآمدها", account_type=AccountType.REVENUE),
            'expense': Account(code="5", name="هزینه‌ها", account_type=AccountType.EXPENSE),
            'debtor': Account(code="6", name="بدهکاران", account_type=AccountType.DEBTOR),
            'creditor': Account(code="7", name="بستانکاران", account_type=AccountType.CREDITOR),
        }
        
        for acc in main_accounts.values():
            db.add(acc)
        db.flush()
        
        # Create sub-accounts (زیرمجموعه‌ها)
        sub_accounts = [
            # دارایی‌ها
            Account(code="11", name="دارایی‌های جاری", account_type=AccountType.ASSET, parent_id=main_accounts['asset'].id),
            Account(code="111", name="صندوق", account_type=AccountType.ASSET, parent_id=None),
            Account(code="112", name="بانک", account_type=AccountType.ASSET, parent_id=None),
            Account(code="113", name="موجودی کالا", account_type=AccountType.ASSET, parent_id=None),
            Account(code="12", name="دارایی‌های ثابت", account_type=AccountType.ASSET, parent_id=main_accounts['asset'].id),
            Account(code="121", name="ساختمان", account_type=AccountType.ASSET, parent_id=None),
            Account(code="122", name="ماشین‌آلات", account_type=AccountType.ASSET, parent_id=None),
            
            # بدهی‌ها
            Account(code="21", name="بدهی‌های جاری", account_type=AccountType.LIABILITY, parent_id=main_accounts['liability'].id),
            Account(code="211", name="حساب‌های پرداختنی", account_type=AccountType.LIABILITY, parent_id=None),
            Account(code="212", name="وام کوتاه‌مدت", account_type=AccountType.LIABILITY, parent_id=None),
            Account(code="22", name="بدهی‌های بلندمدت", account_type=AccountType.LIABILITY, parent_id=main_accounts['liability'].id),
            Account(code="221", name="وام بلندمدت", account_type=AccountType.LIABILITY, parent_id=None),
            
            # حقوق صاحبان سهام
            Account(code="31", name="سرمایه", account_type=AccountType.EQUITY, parent_id=main_accounts['equity'].id),
            Account(code="32", name="سود انباشته", account_type=AccountType.EQUITY, parent_id=main_accounts['equity'].id),
            
            # درآمدها
            Account(code="41", name="درآمد فروش", account_type=AccountType.REVENUE, parent_id=main_accounts['revenue'].id),
            Account(code="411", name="فروش کالا", account_type=AccountType.REVENUE, parent_id=None),
            Account(code="412", name="فروش خدمات", account_type=AccountType.REVENUE, parent_id=None),
            Account(code="42", name="سایر درآمدها", account_type=AccountType.REVENUE, parent_id=main_accounts['revenue'].id),
            
            # هزینه‌ها
            Account(code="51", name="هزینه‌های عملیاتی", account_type=AccountType.EXPENSE, parent_id=main_accounts['expense'].id),
            Account(code="511", name="حقوق و دستمزد", account_type=AccountType.EXPENSE, parent_id=None),
            Account(code="512", name="اجاره", account_type=AccountType.EXPENSE, parent_id=None),
            Account(code="513", name="آب و برق و گاز", account_type=AccountType.EXPENSE, parent_id=None),
            Account(code="514", name="تلفن و اینترنت", account_type=AccountType.EXPENSE, parent_id=None),
            Account(code="52", name="هزینه‌های اداری", account_type=AccountType.EXPENSE, parent_id=main_accounts['expense'].id),
            Account(code="521", name="لوازم اداری", account_type=AccountType.EXPENSE, parent_id=None),
            Account(code="522", name="هزینه تبلیغات", account_type=AccountType.EXPENSE, parent_id=None),
            
            # بدهکاران
            Account(code="61", name="مشتریان", account_type=AccountType.DEBTOR, parent_id=main_accounts['debtor'].id),
            Account(code="62", name="اسناد دریافتنی", account_type=AccountType.DEBTOR, parent_id=main_accounts['debtor'].id),
            
            # بستانکاران
            Account(code="71", name="تامین‌کنندگان", account_type=AccountType.CREDITOR, parent_id=main_accounts['creditor'].id),
            Account(code="72", name="اسناد پرداختنی", account_type=AccountType.CREDITOR, parent_id=main_accounts['creditor'].id),
        ]
        
        # Set parent_id for sub-sub-accounts
        db.flush()
        for acc in sub_accounts:
            if acc.code.startswith('11') and len(acc.code) == 3:
                parent = next((a for a in sub_accounts if a.code == '11'), None)
                if parent:
                    acc.parent_id = parent.id
            elif acc.code.startswith('12') and len(acc.code) == 3:
                parent = next((a for a in sub_accounts if a.code == '12'), None)
                if parent:
                    acc.parent_id = parent.id
            elif acc.code.startswith('21') and len(acc.code) == 3:
                parent = next((a for a in sub_accounts if a.code == '21'), None)
                if parent:
                    acc.parent_id = parent.id
            elif acc.code.startswith('22') and len(acc.code) == 3:
                parent = next((a for a in sub_accounts if a.code == '22'), None)
                if parent:
                    acc.parent_id = parent.id
            elif acc.code.startswith('41') and len(acc.code) == 3:
                parent = next((a for a in sub_accounts if a.code == '41'), None)
                if parent:
                    acc.parent_id = parent.id
            elif acc.code.startswith('51') and len(acc.code) == 3:
                parent = next((a for a in sub_accounts if a.code == '51'), None)
                if parent:
                    acc.parent_id = parent.id
            elif acc.code.startswith('52') and len(acc.code) == 3:
                parent = next((a for a in sub_accounts if a.code == '52'), None)
                if parent:
                    acc.parent_id = parent.id
        
        db.add_all(sub_accounts)
        db.commit()
        
        total_accounts = len(main_accounts) + len(sub_accounts)
        print(f"Successfully created {total_accounts} accounts with hierarchy")
        print("Main categories: 7")
        print("Sub-accounts: ", len(sub_accounts))
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
