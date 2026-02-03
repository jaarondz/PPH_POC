from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Team, TeamMembership

User = get_user_model()


class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "email")


class TeamSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ("id", "name", "code", "parent")


class TeamSerializer(serializers.ModelSerializer):
    parent_detail = TeamSummarySerializer(source="parent", read_only=True)

    class Meta:
        model = Team
        fields = ("id", "name", "code", "parent", "parent_detail", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")


class TeamMembershipSerializer(serializers.ModelSerializer):
    user_detail = UserSummarySerializer(source="user", read_only=True)
    team_detail = TeamSummarySerializer(source="team", read_only=True)

    class Meta:
        model = TeamMembership
        fields = (
            "id",
            "team",
            "team_detail",
            "user",
            "user_detail",
            "role",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")
