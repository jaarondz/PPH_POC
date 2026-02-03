from __future__ import annotations

from django.conf import settings
from django.db import models
from core.models import UUIDModel, TimeStampedModel


def document_upload_to(instance: "Document", filename: str) -> str:
    target = instance.target_type.lower() if instance.target_type else "unknown"
    target_id = instance.target_id or "unassigned"
    return f"documents/{target}/{target_id}/{filename}"


class Document(UUIDModel, TimeStampedModel):
    class Category(models.TextChoices):
        BRD = "BRD", "BRD"
        ERD = "ERD", "ERD"
        PROPOSAL = "PROPOSAL", "Proposal"
        OTHER = "OTHER", "Other"

    class TargetType(models.TextChoices):
        ASSET = "ASSET", "Asset"
        PROJECT = "PROJECT", "Project"
        ACCOMPLISHMENT = "ACCOMPLISHMENT", "Accomplishment"
        REPORT = "REPORT", "Report"

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    category = models.CharField(
        max_length=20, choices=Category.choices, default=Category.OTHER
    )
    version = models.DecimalField(max_digits=4, decimal_places=1, default=0.1)

    file = models.FileField(upload_to=document_upload_to)
    original_filename = models.CharField(max_length=255, blank=True)
    content_type = models.CharField(max_length=255, blank=True)
    size_bytes = models.PositiveBigIntegerField(default=0)

    target_type = models.CharField(max_length=32, choices=TargetType.choices)
    target_id = models.UUIDField()

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="documents_created",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="documents_updated",
    )

    class Meta:
        indexes = [
            models.Index(fields=["target_type", "target_id"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.title} ({self.target_type}:{self.target_id})"
