from django.urls import path
from .views import CreateAdminUserView

urlpatterns = [
    path("create-admin-user", CreateAdminUserView.as_view(), name="create-admin-user"),
]
