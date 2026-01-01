from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import schemas
from database import get_db
from services.voice_service import VoiceService
from services.accounting_service import AccountingService
import aiofiles
import os
from datetime import datetime

router = APIRouter(prefix="/voice", tags=["voice"])
voice_service = VoiceService()


@router.post("/process", response_model=schemas.VoiceResponse)
def process_voice_command(voice_input: schemas.VoiceInput, db: Session = Depends(get_db)):
    """پردازش دستور صوتی و ثبت سند حسابداری"""
    try:
        # پردازش متن و استخراج اطلاعات
        parsed_data = voice_service.parse_voice_command(voice_input.text)
        
        # بررسی موفقیت پردازش
        if not parsed_data['success']:
            error_msg = parsed_data.get('error', 'متأسفانه نتوانستم دستور را درک کنم.')
            return schemas.VoiceResponse(
                success=False,
                message=f"❌ {error_msg}\n\nمثال صحیح: 'پرداخت پانصد هزار تومان به آقا بهداشکاران کن'",
                parsed_data=parsed_data
            )
        
        # ثبت سند حسابداری
        journal_entry = AccountingService.create_journal_entry_from_voice(
            db, parsed_data, voice_input.text
        )
        
        # پیام موفقیت با جزئیات
        amount_formatted = f"{parsed_data['amount']:,.0f} ریال"
        trans_type = "پرداخت" if parsed_data['transaction_type'] == 'payment' else "دریافت"
        
        message = f"✅ سند با موفقیت ثبت شد!\n\n"
        message += f"📋 شماره سند: {journal_entry.entry_number}\n"
        message += f"💰 مبلغ: {amount_formatted}\n"
        message += f"📊 نوع: {trans_type}\n"
        if parsed_data.get('counterparty'):
            message += f"👤 طرف حساب: {parsed_data['counterparty']}\n"
        if parsed_data.get('account_name'):
            message += f"📁 حساب: {parsed_data['account_name']}"
        
        return schemas.VoiceResponse(
            success=True,
            message=message,
            parsed_data=parsed_data,
            journal_entry_id=journal_entry.id
        )
    
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"Error in voice processing: {error_detail}")
        raise HTTPException(
            status_code=500, 
            detail=f"خطا در پردازش دستور: {str(e)}"
        )


@router.post("/upload-audio")
async def upload_audio(file: UploadFile = File(...)):
    try:
        upload_dir = "uploads/audio"
        os.makedirs(upload_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_path = os.path.join(upload_dir, f"{timestamp}_{file.filename}")
        
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        return {
            "success": True,
            "message": "فایل صوتی با موفقیت آپلود شد",
            "file_path": file_path
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطا در آپلود فایل: {str(e)}")
