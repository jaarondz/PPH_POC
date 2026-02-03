from rest_framework import serializers
from .models import (
    Accomplishment,
    AccomplishmentAssetLink,
    AccomplishmentProjectLink,
)
from assets.models import Asset
from projects.models import Project
from users.serializers import TeamSummarySerializer


class AssetSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ("id", "name", "asset_type", "status", "criticality")


class ProjectSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ("id", "name", "project_type", "status", "priority")


class AccomplishmentSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Accomplishment
        fields = ("id", "title", "impact_type", "metric", "start_date", "end_date", "updated_at")


class AccomplishmentAssetLinkSerializer(serializers.ModelSerializer):
    asset_detail = AssetSummarySerializer(source="asset", read_only=True)
    accomplishment_detail = AccomplishmentSummarySerializer(source="accomplishment", read_only=True)

    class Meta:
        model = AccomplishmentAssetLink
        fields = "__all__"
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        )


class AccomplishmentProjectLinkSerializer(serializers.ModelSerializer):
    project_detail = ProjectSummarySerializer(source="project", read_only=True)
    accomplishment_detail = AccomplishmentSummarySerializer(source="accomplishment", read_only=True)

    class Meta:
        model = AccomplishmentProjectLink
        fields = "__all__"
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        )


class AccomplishmentSerializer(serializers.ModelSerializer):
    asset_links = AccomplishmentAssetLinkSerializer(many=True, read_only=True)
    project_links = AccomplishmentProjectLinkSerializer(many=True, read_only=True)
    team_detail = TeamSummarySerializer(source="team", read_only=True)

    class Meta:
        model = Accomplishment
        fields = "__all__"
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        )
