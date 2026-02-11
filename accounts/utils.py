import os
from django.contrib.auth import get_user_model
from django.db import IntegrityError


def create_superuser():
    User = get_user_model()

    username = os.environ.get("DJANGO_SUPERUSER_USERNAME")
    password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")

    if not User.objects.filter(username=username).exists():
        try:
            User.objects.create_superuser(username=username, password=password)
        except IntegrityError as e:
            print(e)
