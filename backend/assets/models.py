from django.conf import settings
from django.db import models
from core.models import UUIDModel, TimeStampedModel
from users.models import OrgUnit


class Asset(UUIDModel, TimeStampedModel):
    class AssetType(models.TextChoices):
        APPLICATION = "APPLICATION", "Application"
        OP_SYSTEM = "OP_SYSTEM", "Operational System"
        FACILITY = "FACILITY", "Facility/Site"

    class Status(models.TextChoices):
        PLANNED = "PLANNED", "Planned"
        ACTIVE = "ACTIVE", "Active"
        DEPRECATED = "DEPRECATED", "Deprecated"
        RETIRED = "RETIRED", "Retired"

    class Criticality(models.TextChoices):
        TIER_0 = "TIER_0", "Tier 0 (Mission Critical)"
        TIER_1 = "TIER_1", "Tier 1"
        TIER_2 = "TIER_2", "Tier 2"
        TIER_3 = "TIER_3", "Tier 3"

    class Scope(models.TextChoices):
        ADMINISTRATIVE = "ADMINISTRATIVE", "Administrative"
        ADULT = "ADULT", "Adult"
        JUVENILE = "JUVENILE", "Juvenile"
        CROSS_CUTTING = "CROSS_CUTTING", "Cross-Cutting"
        OTHER = "OTHER", "Other"

    name = models.CharField(max_length=200)
    acronym = models.CharField(max_length=50, blank=True)
    asset_type = models.CharField(max_length=32, choices=AssetType.choices)
    scope = models.CharField(max_length=20, choices=Scope.choices, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)

    description = models.TextField(blank=True)

    # Ownership
    business_owner = models.CharField(max_length=200, blank=True)
    technical_owner = models.CharField(max_length=200, blank=True)
    business_owner_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="assets_business_owner",
    )
    technical_owner_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="assets_technical_owner",
    )
    owning_org_unit = models.ForeignKey(
        OrgUnit, on_delete=models.SET_NULL, null=True, blank=True, related_name="assets"
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="assigned_assets",
    )

    criticality = models.CharField(
        max_length=16, choices=Criticality.choices, blank=True
    )

    # Risk flags (POC-simple)
    risk_security = models.BooleanField(default=False)
    risk_privacy = models.BooleanField(default=False)
    risk_compliance = models.BooleanField(default=False)

    external_reference_url = models.URLField(blank=True)  # link to CMDB/Intune/etc.
    last_reviewed_at = models.DateField(null=True, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assets_created",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assets_updated",
    )

    class Meta:
        indexes = [
            models.Index(fields=["asset_type", "status"]),
            models.Index(fields=["name"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["name", "asset_type"], name="uniq_asset_name_type"
            )
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.asset_type})"
