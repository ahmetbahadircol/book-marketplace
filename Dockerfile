# 3.14 yerine 3.12-bookworm (Debian tabanlı) kullanıyoruz
FROM python:3.12-bookworm

ENV PYTHONUNBUFFERED=1
WORKDIR /code

# Gerekli temel paketleri kur (wget playwright-deps için şart)
RUN apt-get update && apt-get install -y \
    wget \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /code/
RUN pip install --no-cache-dir -r requirements.txt

# Playwright ve Bağımlılıklarını Kur
# Paketleri tek tek elle yazmak yerine bu iki komut her şeyi otomatik halleder
RUN playwright install chromium
RUN playwright install-deps chromium

COPY . /code/