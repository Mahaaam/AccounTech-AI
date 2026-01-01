import pytesseract
from PIL import Image
import re
from typing import Optional, Dict, Any
from config import settings
import jdatetime


class OCRService:
    def __init__(self):
        if settings.TESSERACT_PATH:
            pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_PATH
    
    def extract_text_from_image(self, image_path: str) -> str:
        try:
            image = Image.open(image_path)
            
            text = pytesseract.image_to_string(
                image,
                lang=settings.OCR_LANGUAGE,
                config='--psm 6'
            )
            
            return text.strip()
        except Exception as e:
            raise Exception(f"خطا در استخراج متن: {str(e)}")
    
    def parse_receipt(self, text: str) -> Dict[str, Any]:
        result = {
            'success': False,
            'amount': None,
            'date': None,
            'vendor': None,
            'items': [],
        }
        
        amount = self._extract_amount(text)
        if amount:
            result['amount'] = amount
            result['success'] = True
        
        date = self._extract_date(text)
        if date:
            result['date'] = date
        
        vendor = self._extract_vendor(text)
        if vendor:
            result['vendor'] = vendor
        
        return result
    
    def _extract_amount(self, text: str) -> Optional[float]:
        patterns = [
            r'(?:مبلغ|جمع|کل|total|amount)[:\s]*(\d+[\d,]*)',
            r'(\d+[\d,]*)\s*(?:ریال|تومان|rials?)',
            r'(?:قابل\s+پرداخت)[:\s]*(\d+[\d,]*)',
        ]
        
        amounts = []
        for pattern in patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                amount_str = match.group(1).replace(',', '').replace('،', '')
                try:
                    amount = float(amount_str)
                    amounts.append(amount)
                except ValueError:
                    continue
        
        if amounts:
            return max(amounts)
        
        return None
    
    def _extract_date(self, text: str) -> Optional[str]:
        patterns = [
            r'(\d{4})[/-](\d{1,2})[/-](\d{1,2})',
            r'(\d{1,2})[/-](\d{1,2})[/-](\d{4})',
            r'(\d{2})[/-](\d{2})[/-](\d{2})',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                try:
                    groups = match.groups()
                    if len(groups[0]) == 4:
                        year, month, day = groups
                    else:
                        day, month, year = groups
                    
                    if len(year) == 2:
                        year = '14' + year
                    
                    return f"{year}/{month.zfill(2)}/{day.zfill(2)}"
                except:
                    continue
        
        return None
    
    def _extract_vendor(self, text: str) -> Optional[str]:
        lines = text.split('\n')
        
        for i, line in enumerate(lines[:5]):
            line = line.strip()
            if len(line) > 3 and not re.match(r'^\d+', line):
                if not any(keyword in line.lower() for keyword in ['receipt', 'invoice', 'فاکتور', 'رسید']):
                    return line
        
        return None
