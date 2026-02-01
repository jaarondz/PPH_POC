from django.contrib import admin
from .models import Asset


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "asset_type",
        "status",
        "criticality",
        "business_owner",
        "technical_owner",
        "owning_org_unit",
        "updated_at",
        "assigned_to",
    )
    list_filter = ("asset_type", "status", "criticality", "owning_org_unit")
    search_fields = ("name", "description", "business_owner", "technical_owner")
    ordering = ("name",)
