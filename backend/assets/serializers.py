from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Asset

User = get_user_model()


class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "email")


class AssetSerializer(serializers.ModelSerializer):
    business_owner_user_detail = UserSummarySerializer(
        source="business_owner_user", read_only=True
    )
    technical_owner_user_detail = UserSummarySerializer(
        source="technical_owner_user", read_only=True
    )

    class Meta:
        model = Asset
        fields = "__all__"
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
            "business_owner",
            "technical_owner",
        )
