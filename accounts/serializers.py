from rest_framework import serializers


class AdminUserPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)
