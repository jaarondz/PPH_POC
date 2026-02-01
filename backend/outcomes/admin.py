from django.contrib import admin
from .models import (
    Accomplishment,
    AccomplishmentAssetLink,
    AccomplishmentProjectLink,
)


class AccomplishmentAssetLinkInline(admin.TabularInline):
    model = AccomplishmentAssetLink
    extra = 1
    autocomplete_fields = ("asset",)
    fields = ("asset",)
    show_change_link = True


class AccomplishmentProjectLinkInline(admin.TabularInline):
    model = AccomplishmentProjectLink
    extra = 1
    autocomplete_fields = ("project",)
    fields = ("project",)
    show_change_link = True


@admin.register(Accomplishment)
class AccomplishmentAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "impact_type",
        "owning_org_unit",
        "created_by",
        "start_date",
        "end_date",
        "updated_at",
    )
    list_filter = ("impact_type", "owning_org_unit")
    search_fields = ("title", "narrative", "metric", "evidence_urls")
    ordering = ("-updated_at", "title")
    inlines = [AccomplishmentProjectLinkInline, AccomplishmentAssetLinkInline]


@admin.register(AccomplishmentAssetLink)
class AccomplishmentAssetLinkAdmin(admin.ModelAdmin):
    list_display = ("accomplishment", "asset", "created_at")
    search_fields = ("accomplishment__title", "asset__name")
    autocomplete_fields = ("accomplishment", "asset")


@admin.register(AccomplishmentProjectLink)
class AccomplishmentProjectLinkAdmin(admin.ModelAdmin):
    list_display = ("accomplishment", "project", "created_at")
    search_fields = ("accomplishment__title", "project__name")
    autocomplete_fields = ("accomplishment", "project")
