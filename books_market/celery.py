import os
from celery import Celery

# Proje adının doğruluğundan emin ol
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'books_market.settings')

app = Celery('books_market')
app.autodiscover_tasks()