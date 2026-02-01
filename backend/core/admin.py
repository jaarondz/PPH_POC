from django.contrib import admin
from .models import Tag, TaggedItem, AuditLog


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name", "description", "created_at", "updated_at")
    search_fields = ("name", "description")
    ordering = ("name",)


@admin.register(TaggedItem)
class TaggedItemAdmin(admin.ModelAdmin):
    list_display = ("tag", "target_type", "target_id", "created_by", "created_at")
    list_filter = ("target_type", "tag")
    search_fields = ("target_id",)
    autocomplete_fields = ("tag",)


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = (
        "created_at",
        "action",
        "app_label",
        "model_name",
        "object_id",
        "actor",
    )
    list_filter = ("action", "app_label", "model_name")
    search_fields = ("object_id", "object_repr")
    ordering = ("-created_at",)
