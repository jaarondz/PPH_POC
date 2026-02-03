from django.conf import settings
from django.db import models
from core.models import UUIDModel, TimeStampedModel


class OrgUnit(UUIDModel, TimeStampedModel):
    """
    Minimal org structure for POC.
    Later: hierarchical org units, cost centers, etc.
    """
    name = models.CharField(max_length=120, unique=True)
    code = models.CharField(max_length=30, blank=True)  # optional short code

    def __str__(self) -> str:
        return self.name


class Team(UUIDModel, TimeStampedModel):
    """
    Team organization with optional hierarchy.
    """

    name = models.CharField(max_length=120, unique=True)
    code = models.CharField(max_length=30, blank=True)
    parent = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="children"
    )

    def __str__(self) -> str:
        return self.name


class TeamMembership(UUIDModel, TimeStampedModel):
    class Role(models.TextChoices):
        DIRECTOR = "DIRECTOR", "Director"
        MANAGER = "MANAGER", "Manager"
        SUPERVISOR = "SUPERVISOR", "Supervisor"
        STAFF = "STAFF", "Line Staff"

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="memberships")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="team_memberships",
    )
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STAFF)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["team", "user"], name="uniq_team_user")
        ]
        indexes = [
            models.Index(fields=["team"], name="users_teamm_team_id_idx"),
            models.Index(fields=["user"], name="users_teamm_user_id_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.team.name}: {self.user_id} ({self.role})"
