import re
from typing import Optional, Dict, Any
import jdatetime


class VoiceService:
    def __init__(self):
        # الگوهای عددی فارسی
        self.persian_numbers = {
            'صفر': 0, 'یک': 1, 'دو': 2, 'سه': 3, 'چهار': 4, 'پنج': 5,
            'شش': 6, 'هفت': 7, 'هشت': 8, 'نه': 9, 'ده': 10,
            'یازده': 11, 'دوازده': 12, 'سیزده': 13, 'چهارده': 14, 'پانزده': 15,
            'شانزده': 16, 'هفده': 17, 'هجده': 18, 'نوزده': 19, 'بیست': 20,
            'سی': 30, 'چهل': 40, 'پنجاه': 50, 'شصت': 60, 'هفتاد': 70,
            'هشتاد': 80, 'نود': 90, 'صد': 100, 'یکصد': 100, 'دویست': 200,
            'سیصد': 300, 'چهارصد': 400, 'پانصد': 500, 'ششصد': 600,
            'هفتصد': 700, 'هشتصد': 800, 'نهصد': 900
        }
        
        self.amount_patterns = [
            r'(\d+)\s*(?:هزار|تومان|ریال)',
            r'(\d+)\s*(?:میلیون)',
            r'(\d+[\d,]*)',
        ]
        
        self.keywords = {
            'payment': ['پرداخت', 'پرداختی', 'دادم', 'دادیم', 'پرداخته', 'کردم', 'کردیم'],
            'receive': ['دریافت', 'دریافتی', 'گرفتم', 'گرفتیم', 'دریافته', 'آوردم'],
            'purchase': ['خرید', 'خریداری', 'خریدم'],
            'sale': ['فروش', 'فروخته', 'فروختم'],
        }
    
    def parse_voice_command(self, text: str) -> Dict[str, Any]:
        """پردازش دستور صوتی و استخراج اطلاعات"""
        text = text.strip().lower()
        
        result = {
            'success': False,
            'amount': None,
            'transaction_type': None,
            'account_name': None,
            'description': text,
            'counterparty': None,
            'error': None,
        }
        
        # 1. استخراج مبلغ (ضروری)
        amount = self._extract_amount(text)
        if not amount or amount <= 0:
            result['error'] = 'مبلغ تراکنش مشخص نیست'
            return result
        
        result['amount'] = amount
        
        # 2. تشخیص نوع تراکنش (پرداخت/دریافت)
        transaction_type = self._detect_transaction_type(text)
        result['transaction_type'] = transaction_type
        
        # 3. استخراج طرف حساب
        counterparty = self._extract_counterparty(text)
        if counterparty:
            result['counterparty'] = counterparty
        
        # 4. استخراج موضوع/هدف
        purpose = self._extract_purpose(text)
        if purpose:
            result['account_name'] = purpose
        else:
            # اگر موضوع مشخص نبود، از نوع تراکنش استفاده کن
            if transaction_type == 'payment':
                result['account_name'] = 'هزینه‌های متفرقه'
            else:
                result['account_name'] = 'درآمدهای متفرقه'
        
        # اگر همه چیز OK بود
        result['success'] = True
        
        return result
    
    def _extract_amount(self, text: str) -> Optional[float]:
        """استخراج مبلغ از متن - پشتیبانی از اعداد فارسی و انگلیسی"""
        text = text.replace('،', '').replace(',', '')
        
        # تبدیل اعداد فارسی به انگلیسی
        text_converted = self._convert_persian_numbers_to_digits(text)
        
        # الگوهای مختلف برای استخراج مبلغ
        patterns = [
            # عدد + میلیون
            r'(\d+(?:\.\d+)?)\s*میلیون',
            # عدد + هزار
            r'(\d+(?:\.\d+)?)\s*هزار',
            # فقط عدد
            r'(\d+(?:\.\d+)?)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text_converted)
            if match:
                try:
                    amount = float(match.group(1))
                    
                    # اعمال ضریب
                    if 'میلیون' in text:
                        amount *= 1_000_000
                    elif 'هزار' in text:
                        amount *= 1_000
                    
                    # تبدیل تومان به ریال
                    if 'تومان' in text:
                        amount *= 10
                    
                    return amount
                except ValueError:
                    continue
        
        return None
    
    def _convert_persian_numbers_to_digits(self, text: str) -> str:
        """تبدیل اعداد فارسی به رقم"""
        result = text
        
        # جایگزینی اعداد فارسی
        for word, number in sorted(self.persian_numbers.items(), key=lambda x: -len(x[0])):
            if word in result:
                # برای اعداد ترکیبی مثل "پانصد و پنجاه"
                result = result.replace(word, str(number))
        
        # حذف "و" بین اعداد و جمع آنها
        # مثال: "500 و 50" -> "550"
        parts = result.split()
        cleaned_parts = []
        i = 0
        while i < len(parts):
            if parts[i].isdigit():
                num = int(parts[i])
                # بررسی اعداد بعدی
                while i + 2 < len(parts) and parts[i + 1] == 'و' and parts[i + 2].isdigit():
                    num += int(parts[i + 2])
                    i += 2
                cleaned_parts.append(str(num))
            else:
                cleaned_parts.append(parts[i])
            i += 1
        
        return ' '.join(cleaned_parts)
    
    def _detect_transaction_type(self, text: str) -> str:
        for trans_type, keywords in self.keywords.items():
            if any(keyword in text for keyword in keywords):
                if trans_type in ['payment', 'purchase']:
                    return 'payment'
                elif trans_type in ['receive', 'sale']:
                    return 'receive'
        
        return 'payment'
    
    def _extract_counterparty(self, text: str) -> Optional[str]:
        """استخراج طرف حساب (نام شخص/شرکت)"""
        patterns = [
            r'(?:به|از)\s+([^\s]+(?:\s+[^\s]+)?(?:\s+[^\s]+)?)',  # به/از + نام
            r'(?:بابت|برای)\s+([^\s]+(?:\s+[^\s]+)?)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                name = match.group(1).strip()
                # حذف کلمات اضافی
                name = name.replace('بابت', '').replace('برای', '').strip()
                if name and len(name) > 1:
                    return name
        
        return None
    
    def _extract_purpose(self, text: str) -> Optional[str]:
        """استخراج موضوع/هدف تراکنش"""
        patterns = [
            r'بابت\s+(.+?)(?:\s*$)',  # بابت + توضیحات تا آخر
            r'برای\s+(.+?)(?:\s*$)',  # برای + توضیحات تا آخر
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                purpose = match.group(1).strip()
                # حذف کلمات اضافی از انتها
                purpose = re.sub(r'\s+(به|از|کن|کنید)\s*$', '', purpose)
                if purpose and len(purpose) > 2:
                    return purpose
        
        # اگر الگوی خاصی پیدا نشد، از کل متن استفاده کن
        return None
