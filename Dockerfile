FROM node:20-slim AS frontend-builder
WORKDIR /build-fe
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build || vite build

FROM python:3.12-bookworm

# Python configuration
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=10000

WORKDIR /code

# System dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt /code/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Playwright setup
RUN playwright install chromium
RUN playwright install-deps chromium

# Project files
COPY . /code/

# Frontend build files copy
COPY --from=frontend-builder /build-fe/dist /code/frontend/dist

RUN python manage.py collectstatic --no-input

EXPOSE 10000

# Start command: Migrate, Celery worker ve Gunicorn
CMD ["sh", "-c", "python manage.py migrate && (celery -A books_market worker --loglevel=info & gunicorn books_market.wsgi:application --bind 0.0.0.0:10000)"]