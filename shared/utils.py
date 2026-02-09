# shared/utils.py
import re

def clean_price_string(price_str):
    """
    Fiyat string'ini (örn: '$1,250.99') DecimalField'a uygun float'a çevirir.
    """
    if not price_str or price_str == "Price not found":
        return 0.00
    
    # 1. Adım: Sadece sayıları ve noktayı tut (Dolar, virgül, boşlukları temizle)
    # replace(',', '') ile binlik ayracı olan virgülü yok ediyoruz
    clean_str = re.sub(r'[^\d.]', '', price_str.replace(',', ''))
    
    try:
        # 2. Adım: Sayıya çevir
        price = float(clean_str)
        
        # 3. Adım: Postgres "Numeric Field Overflow" hatasını önlemek için 
        # Mantıksız büyüklükteki sayıları sınırla (Örn: 10 Milyon)
        if price > 9999999.99:
            return 9999999.99
            
        return price
    except (ValueError, TypeError):
        return 0.00