from rest_framework import viewsets, filters
from core.audit import AuditedModelViewSetMixin
from .models import (
    Accomplishment,
    AccomplishmentAssetLink,
    AccomplishmentProjectLink,
)
from .serializers import (
    AccomplishmentSerializer,
    AccomplishmentAssetLinkSerializer,
    AccomplishmentProjectLinkSerializer,
)
from users.permissions import AccomplishmentPermission, CanViewEverything


class AccomplishmentViewSet(AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = Accomplishment.objects.all().order_by("-updated_at")
    serializer_class = AccomplishmentSerializer
    permission_classes = [AccomplishmentPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "narrative", "metric", "evidence_urls"]
    ordering_fields = ["title", "impact_type", "updated_at"]


class AccomplishmentAssetLinkViewSet(AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = AccomplishmentAssetLink.objects.select_related("accomplishment", "asset").all()
    serializer_class = AccomplishmentAssetLinkSerializer
    permission_classes = [CanViewEverything]

    def get_queryset(self):
        qs = super().get_queryset()
        asset_id = self.request.query_params.get("asset")
        accomplishment_id = self.request.query_params.get("accomplishment")

        if asset_id:
            qs = qs.filter(asset_id=asset_id)
        if accomplishment_id:
            qs = qs.filter(accomplishment_id=accomplishment_id)

        return qs


class AccomplishmentProjectLinkViewSet(AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = AccomplishmentProjectLink.objects.select_related("accomplishment", "project").all()
    serializer_class = AccomplishmentProjectLinkSerializer
    permission_classes = [CanViewEverything]

    def get_queryset(self):
        qs = super().get_queryset()
        project_id = self.request.query_params.get("project")
        accomplishment_id = self.request.query_params.get("accomplishment")

        if project_id:
            qs = qs.filter(project_id=project_id)
        if accomplishment_id:
            qs = qs.filter(accomplishment_id=accomplishment_id)

        return qs