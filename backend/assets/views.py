from rest_framework import viewsets, filters
from core.audit import AuditedModelViewSetMixin
from .models import Asset
from .serializers import AssetSerializer
from users.permissions import AssetPermission
from users.roles import (
    can_modify_all,
    user_in_role,
    ROLE_ASSET_MANAGER,
    ROLE_PORTFOLIO_VIEWER,
    ROLE_TEAM_MEMBER,
)

class AssetViewSet(AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = Asset.objects.all().order_by("name")
    serializer_class = AssetSerializer
    permission_classes = [AssetPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "name",
        "description",
        "business_owner",
        "technical_owner",
        "business_owner_user__username",
        "business_owner_user__first_name",
        "business_owner_user__last_name",
        "technical_owner_user__username",
        "technical_owner_user__first_name",
        "technical_owner_user__last_name",
    ]
    ordering_fields = ["name", "asset_type", "status", "updated_at"]

    def get_queryset(self):
        qs = Asset.objects.exclude(asset_type="REPORT").order_by("name")
        user = self.request.user

        # Portfolio-level roles or asset manager can view all assets
        if can_modify_all(user) or user_in_role(user, ROLE_PORTFOLIO_VIEWER) or user_in_role(user, ROLE_ASSET_MANAGER):
            return qs

        # Team members (and anyone else) only see assigned assets
        return qs.filter(assigned_to=user)
