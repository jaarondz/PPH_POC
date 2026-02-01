from __future__ import annotations

from datetime import date, datetime, time
from decimal import Decimal
from typing import Any, Dict
from uuid import UUID

from django.db import models

from .models import AuditLog


def _model_has_field(model: type[models.Model], field_name: str) -> bool:
    try:
        model._meta.get_field(field_name)
        return True
    except Exception:
        return False


def _serialize_value(value: Any) -> Any:
    if isinstance(value, models.Model):
        return str(value.pk)
    if isinstance(value, (datetime, date, time)):
        return value.isoformat()
    if isinstance(value, UUID):
        return str(value)
    if isinstance(value, Decimal):
        return str(value)
    return value


class AuditedModelViewSetMixin:
    """Adds created_by/updated_by stamping and audit log entries."""

    def _build_changes(self, instance: models.Model, validated_data: Dict[str, Any]) -> Dict[str, Any]:
        changes: Dict[str, Any] = {}
        model = instance.__class__

        for field_name, new_value in validated_data.items():
            try:
                field = model._meta.get_field(field_name)
            except Exception:
                continue

            if field.many_to_many:
                continue

            old_value = getattr(instance, field_name)
            if field.is_relation:
                old_value = old_value.pk if old_value else None
                if isinstance(new_value, models.Model):
                    new_value = new_value.pk

            if old_value != new_value:
                changes[field_name] = {
                    "from": _serialize_value(old_value),
                    "to": _serialize_value(new_value),
                }

        return changes

    def _build_create_changes(self, validated_data: Dict[str, Any]) -> Dict[str, Any]:
        changes: Dict[str, Any] = {}
        for field_name, value in validated_data.items():
            if isinstance(value, models.Model):
                value = value.pk
            changes[field_name] = {"from": None, "to": _serialize_value(value)}
        return changes

    def _build_snapshot(self, instance: models.Model) -> Dict[str, Any]:
        snapshot: Dict[str, Any] = {}
        for field in instance._meta.fields:
            value = getattr(instance, field.name)
            if field.is_relation:
                value = value.pk if value else None
            snapshot[field.name] = _serialize_value(value)
        return snapshot

    def _log_audit(
        self,
        action: str,
        instance: models.Model,
        user,
        changes: Dict[str, Any] | None = None,
        snapshot: Dict[str, Any] | None = None,
    ) -> None:
        AuditLog.objects.create(
            actor=user if user and user.is_authenticated else None,
            action=action,
            app_label=instance._meta.app_label,
            model_name=instance.__class__.__name__,
            object_id=str(instance.pk),
            object_repr=str(instance),
            changes=changes or {},
            snapshot=snapshot or {},
        )

    def perform_create(self, serializer):
        user = getattr(self.request, "user", None)
        extra = {}
        model = serializer.Meta.model

        if user and user.is_authenticated:
            if _model_has_field(model, "created_by"):
                extra["created_by"] = user
            if _model_has_field(model, "updated_by"):
                extra["updated_by"] = user

        instance = serializer.save(**extra)
        changes = self._build_create_changes(serializer.validated_data)
        self._log_audit("CREATE", instance, user, changes=changes)

    def perform_update(self, serializer):
        user = getattr(self.request, "user", None)
        instance = serializer.instance
        changes = self._build_changes(instance, serializer.validated_data)
        extra = {}
        model = serializer.Meta.model

        if user and user.is_authenticated and _model_has_field(model, "updated_by"):
            extra["updated_by"] = user

        instance = serializer.save(**extra)
        self._log_audit("UPDATE", instance, user, changes=changes)

    def perform_destroy(self, instance):
        user = getattr(self.request, "user", None)
        snapshot = self._build_snapshot(instance)
        self._log_audit("DELETE", instance, user, changes={}, snapshot=snapshot)
        instance.delete()
