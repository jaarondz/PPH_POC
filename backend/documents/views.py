from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from core.audit import AuditedModelViewSetMixin
from .models import Document
from .serializers import DocumentSerializer


class DocumentViewSet(AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = Document.objects.all().order_by("-created_at")
    serializer_class = DocumentSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        qs = super().get_queryset()
        target_type = self.request.query_params.get("target_type")
        target_id = self.request.query_params.get("target_id")
        if target_type:
            qs = qs.filter(target_type=target_type)
        if target_id:
            qs = qs.filter(target_id=target_id)
        return qs
