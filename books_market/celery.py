import os
from celery import Celery

# Proje adının doğruluğundan emin ol
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'books_market.settings')

app = Celery('books_market')

# Load task modules from all registered Django app configs.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks from all registered apps.
app.autodiscover_tasks()