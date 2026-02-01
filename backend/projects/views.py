from rest_framework import viewsets, filters
from core.audit import AuditedModelViewSetMixin
from rest_framework.exceptions import PermissionDenied
from .models import Project, ProjectAssetLink, ProjectTask, ProjectMilestone
from .serializers import (
    ProjectSerializer,
    ProjectAssetLinkSerializer,
    ProjectTaskSerializer,
    ProjectMilestoneSerializer,
)
from users.permissions import ProjectPermission, ProjectChildPermission
from users.roles import (
    can_modify_all,
    user_in_role,
    ROLE_PROJECT_MANAGER,
    ROLE_PORTFOLIO_VIEWER,
    ROLE_TEAM_MEMBER,
)

class ProjectViewSet(AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by("-updated_at")
    serializer_class = ProjectSerializer
    permission_classes = [ProjectPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "summary", "sponsor"]
    ordering_fields = ["name", "status", "priority", "updated_at"]

    def get_queryset(self):
        qs = Project.objects.all().order_by("-updated_at")
        user = self.request.user

        if can_modify_all(user) or user_in_role(user, ROLE_PORTFOLIO_VIEWER) or user_in_role(user, ROLE_PROJECT_MANAGER):
            return qs

        return qs.filter(assigned_to=user)

class ProjectAssetLinkViewSet(AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = ProjectAssetLink.objects.select_related("project", "asset").all()
    serializer_class = ProjectAssetLinkSerializer
    permission_classes = [ProjectPermission]
    filter_backends = [filters.SearchFilter]
    search_fields = ["project__name", "asset__name"]

    def get_queryset(self):
        qs = super().get_queryset()
        asset_id = self.request.query_params.get("asset")
        project_id = self.request.query_params.get("project")

        if asset_id:
            qs = qs.filter(asset_id=asset_id)
        if project_id:
            qs = qs.filter(project_id=project_id)

        return qs


class ProjectTaskViewSet(AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = ProjectTask.objects.select_related("project", "assigned_to").all()
    serializer_class = ProjectTaskSerializer
    permission_classes = [ProjectPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["description", "project__name", "assigned_to__username"]
    ordering_fields = ["start_date", "end_date", "status", "updated_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        project_id = self.request.query_params.get("project")
        status = self.request.query_params.get("status")

        if project_id:
            qs = qs.filter(project_id=project_id)
        if status:
            qs = qs.filter(status=status)

        return qs


class ProjectMilestoneViewSet(AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = ProjectMilestone.objects.select_related("project", "assigned_to").all()
    serializer_class = ProjectMilestoneSerializer
    permission_classes = [ProjectChildPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "project__name"]
    ordering_fields = ["due_date", "status", "updated_at"]

    def get_queryset(self):
        qs = super().get_queryset()
        project_id = self.request.query_params.get("project")
        status = self.request.query_params.get("status")

        if project_id:
            qs = qs.filter(project_id=project_id)
        if status:
            qs = qs.filter(status=status)

        user = self.request.user
        if can_modify_all(user) or user_in_role(user, ROLE_PORTFOLIO_VIEWER) or user_in_role(user, ROLE_PROJECT_MANAGER):
            return qs

        return qs.filter(project__assigned_to=user)

    def perform_create(self, serializer):
        project = serializer.validated_data.get("project")
        user = getattr(self.request, "user", None)

        if project and not (
            can_modify_all(user)
            or user_in_role(user, ROLE_PORTFOLIO_VIEWER)
            or (user_in_role(user, ROLE_PROJECT_MANAGER) and project.assigned_to_id == user.id)
        ):
            raise PermissionDenied("Not allowed to add milestones for this project.")

        super().perform_create(serializer)