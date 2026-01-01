from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import schemas
import models
from database import get_db
from services.ocr_service import OCRService
import aiofiles
import os
from datetime import datetime

router = APIRouter(prefix="/ocr", tags=["ocr"])
ocr_service = OCRService()


@router.post("/process-receipt", response_model=schemas.OCRResponse)
async def process_receipt(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        upload_dir = "uploads/receipts"
        os.makedirs(upload_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_path = os.path.join(upload_dir, f"{timestamp}_{file.filename}")
        
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        extracted_text = ocr_service.extract_text_from_image(file_path)
        
        parsed_data = ocr_service.parse_receipt(extracted_text)
        
        receipt = models.Receipt(
            image_path=file_path,
            extracted_text=extracted_text,
            amount=parsed_data.get('amount'),
            date=datetime.strptime(parsed_data.get('date'), "%Y/%m/%d") if parsed_data.get('date') else None,
            vendor=parsed_data.get('vendor'),
            is_processed=False
        )
        db.add(receipt)
        db.commit()
        
        return schemas.OCRResponse(
            success=parsed_data['success'],
            message="فیش با موفقیت پردازش شد" if parsed_data['success'] else "اطلاعات کامل استخراج نشد",
            extracted_text=extracted_text,
            amount=parsed_data.get('amount'),
            date=parsed_data.get('date'),
            vendor=parsed_data.get('vendor')
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطا در پردازش فیش: {str(e)}")


@router.get("/receipts")
def get_receipts(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    receipts = db.query(models.Receipt).order_by(
        models.Receipt.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return receipts


@router.post("/receipts/{receipt_id}/create-entry")
def create_entry_from_receipt(receipt_id: int, entry_data: schemas.JournalEntryCreate, 
                              db: Session = Depends(get_db)):
    receipt = db.query(models.Receipt).filter(models.Receipt.id == receipt_id).first()
    
    if not receipt:
        raise HTTPException(status_code=404, detail="فیش یافت نشد")
    
    from services.accounting_service import AccountingService
    entry_number = AccountingService._generate_entry_number(db)
    
    journal_entry = models.JournalEntry(
        entry_number=entry_number,
        date=entry_data.date,
        description=entry_data.description,
        reference=entry_data.reference,
        source='ocr',
        image_path=receipt.image_path
    )
    db.add(journal_entry)
    db.flush()
    
    for trans in entry_data.transactions:
        transaction = models.Transaction(
            journal_entry_id=journal_entry.id,
            account_id=trans.account_id,
            transaction_type=trans.transaction_type,
            amount=trans.amount,
            description=trans.description
        )
        db.add(transaction)
    
    receipt.is_processed = True
    receipt.journal_entry_id = journal_entry.id
    
    db.commit()
    db.refresh(journal_entry)
    
    return journal_entry
