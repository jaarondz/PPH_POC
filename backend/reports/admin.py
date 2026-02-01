from django.contrib import admin
from .models import Report, ReportAssetLink, ReportAccomplishmentLink


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ("name", "status", "business_owner", "technical_owner", "updated_at")
    search_fields = ("name", "description", "business_owner", "technical_owner")
    list_filter = ("status",)


@admin.register(ReportAssetLink)
class ReportAssetLinkAdmin(admin.ModelAdmin):
    list_display = ("report", "asset")


@admin.register(ReportAccomplishmentLink)
class ReportAccomplishmentLinkAdmin(admin.ModelAdmin):
    list_display = ("report", "accomplishment")
