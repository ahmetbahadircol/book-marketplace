import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import AdminUserPasswordSerializer
from .utils import create_superuser

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt


@method_decorator(csrf_exempt, name="dispatch")
class CreateAdminUserView(APIView):
    permission_classes = []

    def post(self, request, *args, **kwargs):
        serializer = AdminUserPasswordSerializer(data=request.data)
        if serializer.is_valid():
            provided_password = serializer.validated_data.get("password")
            env_password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")

            if provided_password == env_password:
                create_superuser()
                return Response(
                    {"message": "Superuser creation triggered."},
                    status=status.HTTP_201_CREATED,
                )
            else:
                return Response(
                    {"error": "Invalid password."}, status=status.HTTP_403_FORBIDDEN
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
