from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Report, ReportAssetLink, ReportAccomplishmentLink
from assets.models import Asset
from outcomes.models import Accomplishment
from users.serializers import TeamSummarySerializer

User = get_user_model()


class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "email")


class AssetSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ("id", "name", "asset_type", "status", "criticality")


class AccomplishmentSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Accomplishment
        fields = ("id", "title", "impact_type", "metric", "start_date", "end_date", "updated_at")


class ReportSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ("id", "name", "status", "updated_at")


class ReportAssetLinkSerializer(serializers.ModelSerializer):
    report_detail = ReportSummarySerializer(source="report", read_only=True)
    asset_detail = AssetSummarySerializer(source="asset", read_only=True)

    class Meta:
        model = ReportAssetLink
        fields = "__all__"
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        )


class ReportAccomplishmentLinkSerializer(serializers.ModelSerializer):
    report_detail = ReportSummarySerializer(source="report", read_only=True)
    accomplishment_detail = AccomplishmentSummarySerializer(source="accomplishment", read_only=True)

    class Meta:
        model = ReportAccomplishmentLink
        fields = "__all__"
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        )


class ReportSerializer(serializers.ModelSerializer):
    asset_links = ReportAssetLinkSerializer(many=True, read_only=True)
    accomplishment_links = ReportAccomplishmentLinkSerializer(many=True, read_only=True)
    business_owner_user_detail = UserSummarySerializer(
        source="business_owner_user", read_only=True
    )
    technical_owner_user_detail = UserSummarySerializer(
        source="technical_owner_user", read_only=True
    )
    developer_user_detail = UserSummarySerializer(
        source="developer_user", read_only=True
    )
    team_detail = TeamSummarySerializer(source="team", read_only=True)

    class Meta:
        model = Report
        fields = "__all__"
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
            "business_owner",
            "technical_owner",
            "developer",
        )
