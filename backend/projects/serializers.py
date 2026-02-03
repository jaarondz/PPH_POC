from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Project, ProjectAssetLink, ProjectTask, ProjectMilestone, ProjectIssue
from assets.models import Asset
from users.serializers import TeamSummarySerializer

User = get_user_model()


class AssetSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ("id", "name", "asset_type", "status", "criticality")


class ProjectSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ("id", "name", "project_type", "status", "priority", "start_date", "target_end_date")


class ProjectAssetLinkSerializer(serializers.ModelSerializer):
    asset_detail = AssetSummarySerializer(source="asset", read_only=True)
    project_detail = ProjectSummarySerializer(source="project", read_only=True)

    class Meta:
        model = ProjectAssetLink
        fields = "__all__"
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        )


class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "email")


class ProjectTaskSerializer(serializers.ModelSerializer):
    project_detail = ProjectSummarySerializer(source="project", read_only=True)
    assigned_to_detail = UserSummarySerializer(source="assigned_to", read_only=True)
    issue_detail = serializers.SerializerMethodField()

    class Meta:
        model = ProjectTask
        fields = "__all__"
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        )

    def get_issue_detail(self, obj: ProjectTask):
        issue = getattr(obj, "issue", None)
        if not issue:
            return None
        return {
            "id": issue.id,
            "title": issue.title,
            "issue_type": issue.issue_type,
            "status": issue.status,
            "severity": issue.severity,
        }

    def validate(self, attrs):
        assigned_to = attrs.get("assigned_to")
        start_date = attrs.get("start_date")
        end_date = attrs.get("end_date")
        issue = attrs.get("issue")
        project = attrs.get("project")

        if self.instance:
            if project is None:
                project = self.instance.project
            if issue is None:
                issue = self.instance.issue

        if self.instance is None:
            if assigned_to is None:
                raise serializers.ValidationError({"assigned_to": "Task must be assigned to a person."})
        elif "assigned_to" in attrs and assigned_to is None:
            raise serializers.ValidationError({"assigned_to": "Task must be assigned to a person."})

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({"end_date": "End date cannot be before start date."})

        if issue and project and issue.project_id != project.id:
            raise serializers.ValidationError({"issue": "Issue must belong to the same project."})

        return attrs


class ProjectMilestoneSerializer(serializers.ModelSerializer):
    project_detail = ProjectSummarySerializer(source="project", read_only=True)
    assigned_to_detail = UserSummarySerializer(source="assigned_to", read_only=True)

    class Meta:
        model = ProjectMilestone
        fields = "__all__"
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        )


class ProjectIssueSerializer(serializers.ModelSerializer):
    assigned_to_detail = UserSummarySerializer(source="assigned_to", read_only=True)
    project_detail = ProjectSummarySerializer(source="project", read_only=True)

    class Meta:
        model = ProjectIssue
        fields = "__all__"
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        )


class ProjectSerializer(serializers.ModelSerializer):
    asset_links = ProjectAssetLinkSerializer(many=True, read_only=True)
    team_detail = TeamSummarySerializer(source="team", read_only=True)

    class Meta:
        model = Project
        fields = "__all__"
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        )
