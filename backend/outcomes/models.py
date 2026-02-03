from django.conf import settings
from django.db import models
from core.models import UUIDModel, TimeStampedModel
from assets.models import Asset
from projects.models import Project
from users.models import OrgUnit, Team


class Accomplishment(UUIDModel, TimeStampedModel):
    class ImpactType(models.TextChoices):
        RISK = "RISK", "Risk Reduction"
        COST = "COST", "Cost Savings / Avoidance"
        SPEED = "SPEED", "Speed / Throughput"
        QUALITY = "QUALITY", "Quality / Reliability"
        CUSTOMER = "CUSTOMER", "Customer Experience"

    title = models.CharField(max_length=200)
    narrative = models.TextField(blank=True)

    impact_type = models.CharField(max_length=16, choices=ImpactType.choices, blank=True)
    metric = models.CharField(max_length=255, blank=True)

    evidence_urls = models.TextField(
        blank=True,
        help_text="POC: paste one or more URLs (one per line). Later: normalize into a related table.",
    )

    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    owning_org_unit = models.ForeignKey(
        OrgUnit, on_delete=models.SET_NULL, null=True, blank=True, related_name="accomplishments"
    )
    team = models.ForeignKey(
        Team, on_delete=models.SET_NULL, null=True, blank=True, related_name="accomplishments"
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="accomplishments_created",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="accomplishments_updated",
    )

    def __str__(self) -> str:
        return self.title


class AccomplishmentAssetLink(UUIDModel, TimeStampedModel):
    accomplishment = models.ForeignKey(
        Accomplishment, on_delete=models.CASCADE, related_name="asset_links"
    )
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name="accomplishment_links")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="accomplishment_asset_links_created",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="accomplishment_asset_links_updated",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["accomplishment", "asset"], name="uniq_accomplishment_asset"
            )
        ]


class AccomplishmentProjectLink(UUIDModel, TimeStampedModel):
    accomplishment = models.ForeignKey(
        Accomplishment, on_delete=models.CASCADE, related_name="project_links"
    )
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="accomplishment_links")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="accomplishment_project_links_created",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="accomplishment_project_links_updated",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["accomplishment", "project"], name="uniq_accomplishment_project"
            )
        ]
