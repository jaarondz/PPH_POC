from rest_framework import viewsets, filters
from core.audit import AuditedModelViewSetMixin
from .models import Report, ReportAssetLink, ReportAccomplishmentLink
from .serializers import (
    ReportSerializer,
    ReportAssetLinkSerializer,
    ReportAccomplishmentLinkSerializer,
)
from users.permissions import ReportPermission, CanViewEverything
from users.roles import can_modify_all, user_in_role, ROLE_ASSET_MANAGER, ROLE_PORTFOLIO_VIEWER


class ReportViewSet(AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = Report.objects.all().order_by("name")
    serializer_class = ReportSerializer
    permission_classes = [ReportPermission]
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
        "developer_user__username",
        "developer_user__first_name",
        "developer_user__last_name",
    ]
    ordering_fields = ["name", "status", "updated_at"]

    def get_queryset(self):
        qs = Report.objects.all().order_by("name")
        user = self.request.user

        if can_modify_all(user) or user_in_role(user, ROLE_PORTFOLIO_VIEWER) or user_in_role(user, ROLE_ASSET_MANAGER):
            return qs

        return qs.filter(assigned_to=user)


class ReportAssetLinkViewSet(AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = ReportAssetLink.objects.select_related("report", "asset").all()
    serializer_class = ReportAssetLinkSerializer
    permission_classes = [CanViewEverything]

    def get_queryset(self):
        qs = super().get_queryset()
        report_id = self.request.query_params.get("report")
        asset_id = self.request.query_params.get("asset")

        if report_id:
            qs = qs.filter(report_id=report_id)
        if asset_id:
            qs = qs.filter(asset_id=asset_id)

        return qs


class ReportAccomplishmentLinkViewSet(AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = ReportAccomplishmentLink.objects.select_related(
        "report", "accomplishment"
    ).all()
    serializer_class = ReportAccomplishmentLinkSerializer
    permission_classes = [CanViewEverything]

    def get_queryset(self):
        qs = super().get_queryset()
        report_id = self.request.query_params.get("report")
        accomplishment_id = self.request.query_params.get("accomplishment")

        if report_id:
            qs = qs.filter(report_id=report_id)
        if accomplishment_id:
            qs = qs.filter(accomplishment_id=accomplishment_id)

        return qs
