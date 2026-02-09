# 1. Aşama: Python tabanlı Debian görüntüsü (Playwright için en kararlısı)
FROM python:3.12-bookworm

# 2. Aşama: Python çıktılarını ve pyc dosyalarını optimize et
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 3. Aşama: Çalışma dizinini ayarla
WORKDIR /code

# 4. Aşama: Sistem bağımlılıklarını kur (Gerekli temel paketler)
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# 5. Aşama: Bağımlılıkları kopyala ve kur
COPY requirements.txt /code/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 6. Aşama: Playwright ve sistem bağımlılıklarını kur
# Not: "playwright install-deps" komutu Playwright'ın çalışması için gereken 
# Linux kütüphanelerini (libgbm vb.) sisteme yükler.
RUN playwright install chromium
RUN playwright install-deps chromium

# 7. Aşama: Proje dosyalarını kopyala
COPY . /code/

# 8. Aşama: Portu Render için ayarla
ENV PORT=10000
EXPOSE 10000

# 9. Aşama: Çalıştırma komutu
# Bu komut sırasıyla: Migration yapar, ardından Gunicorn'u başlatır.
# "books_market" kısmını wsgi.py klasör adınla eşleştiğinden emin ol!
CMD ["sh", "-c", "python manage.py collectstatic --no-input && python manage.py migrate && gunicorn books_market.wsgi:application --bind 0.0.0.0:10000"]