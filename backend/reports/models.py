from django.conf import settings
from django.db import models
from core.models import UUIDModel, TimeStampedModel
from assets.models import Asset
from outcomes.models import Accomplishment
from users.models import OrgUnit, Team


class Report(UUIDModel, TimeStampedModel):
    class Status(models.TextChoices):
        PLANNED = "PLANNED", "Planned"
        IN_DEVELOPMENT = "IN_DEVELOPMENT", "In Development"
        ACTIVE = "ACTIVE", "Active"
        DEPRECATED = "DEPRECATED", "Deprecated"
        RETIRED = "RETIRED", "Retired"

    class Automation(models.TextChoices):
        AUTOMATED = "AUTOMATED", "Automated"
        MANUAL = "MANUAL", "Manual"

    class ReportType(models.TextChoices):
        POWER_BI = "POWER_BI", "Power BI"
        EXCEL = "EXCEL", "Excel"
        OTHER = "OTHER", "Other"

    class DeliveryMethod(models.TextChoices):
        POWER_BI = "POWER_BI", "Power BI"
        AUTOMATED_EMAIL = "AUTOMATED_EMAIL", "Automated Email"
        MANUAL_EMAIL = "MANUAL_EMAIL", "Manual Email"

    class RefreshFrequency(models.TextChoices):
        MONTHLY = "MONTHLY", "Monthly"
        WEEKLY = "WEEKLY", "Weekly"
        DAILY = "DAILY", "Daily"
        MULTIPLE_DAILY = "MULTIPLE_DAILY", "Multiple Times Daily"

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)

    developer = models.CharField(max_length=200, blank=True)
    developer_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="reports_developer",
    )
    automation = models.CharField(
        max_length=12, choices=Automation.choices, blank=True, default=""
    )
    report_type = models.CharField(
        max_length=20, choices=ReportType.choices, blank=True, default=""
    )
    delivery_method = models.CharField(
        max_length=30, choices=DeliveryMethod.choices, blank=True, default=""
    )
    refresh_frequency = models.CharField(
        max_length=20, choices=RefreshFrequency.choices, blank=True, default=""
    )

    business_owner = models.CharField(max_length=200, blank=True)
    technical_owner = models.CharField(max_length=200, blank=True)
    business_owner_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="reports_business_owner",
    )
    technical_owner_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="reports_technical_owner",
    )

    owning_org_unit = models.ForeignKey(
        OrgUnit, on_delete=models.SET_NULL, null=True, blank=True, related_name="reports"
    )
    team = models.ForeignKey(
        Team, on_delete=models.SET_NULL, null=True, blank=True, related_name="reports"
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="assigned_reports",
    )

    external_reference_url = models.URLField(blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reports_created",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reports_updated",
    )

    def __str__(self) -> str:
        return self.name


class ReportAssetLink(UUIDModel, TimeStampedModel):
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name="asset_links")
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name="report_links")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="report_asset_links_created",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="report_asset_links_updated",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["report", "asset"], name="uniq_report_asset")
        ]


class ReportAccomplishmentLink(UUIDModel, TimeStampedModel):
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name="accomplishment_links")
    accomplishment = models.ForeignKey(
        Accomplishment, on_delete=models.CASCADE, related_name="report_links"
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="report_accomplishment_links_created",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="report_accomplishment_links_updated",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["report", "accomplishment"], name="uniq_report_accomplishment"
            )
        ]
