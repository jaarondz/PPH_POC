import uuid
from django.conf import settings
from django.db import models


class TimeStampedModel(models.Model):
    """Reusable base model that adds created/updated timestamps."""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class UUIDModel(models.Model):
    """Reusable base model that uses UUID as primary key."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class Tag(UUIDModel, TimeStampedModel):
    """
    Simple global tag. Keep it lightweight for POC.
    Later: add tag namespaces, org scoping, etc.
    """
    name = models.CharField(max_length=64, unique=True)
    description = models.CharField(max_length=255, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tags_created",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tags_updated",
    )

    def __str__(self) -> str:
        return self.name


class TaggedItem(UUIDModel, TimeStampedModel):
    """
    Polymorphic-ish tagging without GenericForeignKey.
    We store the target object as (target_type, target_id).
    This is reporting-friendly and avoids contenttypes complexity.
    """
    class TargetType(models.TextChoices):
        ASSET = "ASSET", "Asset"
        PROJECT = "PROJECT", "Project"
        ACCOMPLISHMENT = "ACCOMPLISHMENT", "Accomplishment"

    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, related_name="tagged_items")
    target_type = models.CharField(max_length=32, choices=TargetType.choices)
    target_id = models.UUIDField()

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_tags",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="updated_tags",
    )

    class Meta:
        indexes = [
            models.Index(fields=["target_type", "target_id"]),
            models.Index(fields=["tag"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["tag", "target_type", "target_id"], name="uniq_tag_target"
            )
        ]

    def __str__(self) -> str:
        return f"{self.tag.name} -> {self.target_type}:{self.target_id}"


class AuditLog(UUIDModel):
    class Action(models.TextChoices):
        CREATE = "CREATE", "Create"
        UPDATE = "UPDATE", "Update"
        DELETE = "DELETE", "Delete"

    created_at = models.DateTimeField(auto_now_add=True)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
    )
    action = models.CharField(max_length=12, choices=Action.choices)

    app_label = models.CharField(max_length=100)
    model_name = models.CharField(max_length=100)
    object_id = models.CharField(max_length=64)
    object_repr = models.CharField(max_length=200, blank=True)

    changes = models.JSONField(default=dict, blank=True)
    snapshot = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["app_label", "model_name", "object_id"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["actor"]),
        ]

    def __str__(self) -> str:
        return f"{self.action} {self.app_label}.{self.model_name} {self.object_id}"
