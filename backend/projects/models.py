from django.conf import settings
from django.db import models
from core.models import UUIDModel, TimeStampedModel
from assets.models import Asset
from users.models import OrgUnit, Team


class Project(UUIDModel, TimeStampedModel):
    class ProjectType(models.TextChoices):
        NEW_BUILD = "NEW_BUILD", "New Build"
        ENHANCEMENT = "ENHANCEMENT", "Enhancement"
        MAINTENANCE = "MAINTENANCE", "Maintenance"
        INFRA = "INFRA", "Infrastructure"
        FACILITIES = "FACILITIES", "Facilities"
        SECURITY = "SECURITY", "Security/Compliance"
        DISCOVERY = "DISCOVERY", "Discovery/Research"

    class Status(models.TextChoices):
        INTAKE = "INTAKE", "Intake"
        PLANNED = "PLANNED", "Planned"
        ACTIVE = "ACTIVE", "Active"
        BLOCKED = "BLOCKED", "Blocked"
        DONE = "DONE", "Done"
        CANCELLED = "CANCELLED", "Cancelled"

    class Priority(models.TextChoices):
        P0 = "P0", "P0"
        P1 = "P1", "P1"
        P2 = "P2", "P2"
        P3 = "P3", "P3"

    class Scope(models.TextChoices):
        ADMINISTRATIVE = "ADMINISTRATIVE", "Administrative"
        ADULT = "ADULT", "Adult"
        JUVENILE = "JUVENILE", "Juvenile"
        CROSS_CUTTING = "CROSS_CUTTING", "Cross-Cutting"
        OTHER = "OTHER", "Other"

    name = models.CharField(max_length=200)
    summary = models.TextField(blank=True)

    project_type = models.CharField(max_length=24, choices=ProjectType.choices)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.INTAKE)
    priority = models.CharField(max_length=4, choices=Priority.choices, default=Priority.P2)
    scope = models.CharField(max_length=20, choices=Scope.choices, blank=True)

    sponsor = models.CharField(max_length=200, blank=True)  # requestor/sponsor in POC
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="projects_owned",
    )
    owning_org_unit = models.ForeignKey(
        OrgUnit, on_delete=models.SET_NULL, null=True, blank=True, related_name="projects"
    )
    team = models.ForeignKey(
        Team, on_delete=models.SET_NULL, null=True, blank=True, related_name="projects"
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="assigned_projects",
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="projects_created",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="projects_updated",
    )

    start_date = models.DateField(null=True, blank=True)
    target_end_date = models.DateField(null=True, blank=True)

    def __str__(self) -> str:
        return self.name


class ProjectAssetLink(UUIDModel, TimeStampedModel):
    class RelationshipType(models.TextChoices):
        IMPACTS = "IMPACTS", "Impacts"
        ENHANCES = "ENHANCES", "Enhances"
        MAINTAINS = "MAINTAINS", "Maintains"
        BUILDS = "BUILDS", "Builds"
        REPLACES = "REPLACES", "Replaces"
        DECOMMISSIONS = "DECOMMISSIONS", "Decommissions"
        DEPENDS_ON = "DEPENDS_ON", "Depends On"

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="asset_links")
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name="project_links")
    relationship_type = models.CharField(max_length=20, choices=RelationshipType.choices)

    notes = models.CharField(max_length=255, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="project_asset_links_created",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="project_asset_links_updated",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["project", "asset", "relationship_type"],
                name="uniq_project_asset_relationship",
            )
        ]
        indexes = [
            models.Index(fields=["project"]),
            models.Index(fields=["asset"]),
        ]

    def __str__(self) -> str:
        return f"{self.project.name} {self.relationship_type} {self.asset.name}"


class ProjectIssue(UUIDModel, TimeStampedModel):
    class IssueType(models.TextChoices):
        BUG = "BUG", "Bug"
        DEFECT = "DEFECT", "Defect"

    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        RESOLVED = "RESOLVED", "Resolved"
        CLOSED = "CLOSED", "Closed"

    class Severity(models.TextChoices):
        LOW = "LOW", "Low"
        MEDIUM = "MEDIUM", "Medium"
        HIGH = "HIGH", "High"
        CRITICAL = "CRITICAL", "Critical"

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="issues")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    issue_type = models.CharField(max_length=10, choices=IssueType.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    severity = models.CharField(
        max_length=10, choices=Severity.choices, default=Severity.MEDIUM
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="project_issues",
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="project_issues_created",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="project_issues_updated",
    )

    class Meta:
        indexes = [
            models.Index(fields=["project"], name="projects_p_project_id_idx"),
            models.Index(fields=["status"], name="projects_p_status_idx"),
            models.Index(fields=["severity"], name="projects_p_severity_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.project.name}: {self.title}"


class ProjectTask(UUIDModel, TimeStampedModel):
    class Status(models.TextChoices):
        NOT_STARTED = "NOT_STARTED", "Not Started"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        BLOCKED = "BLOCKED", "Blocked"
        DONE = "DONE", "Done"

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="tasks")
    issue = models.ForeignKey(
        ProjectIssue,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasks",
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="project_tasks",
    )

    description = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NOT_STARTED)

    start_date = models.DateField()
    end_date = models.DateField()

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="project_tasks_created",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="project_tasks_updated",
    )

    class Meta:
        indexes = [
            models.Index(fields=["project", "status"]),
            models.Index(fields=["assigned_to"]),
        ]

    def __str__(self) -> str:
        return f"{self.project.name}: {self.description[:60]}"


class ProjectMilestone(UUIDModel, TimeStampedModel):
    class Status(models.TextChoices):
        PLANNED = "PLANNED", "Planned"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        AT_RISK = "AT_RISK", "At Risk"
        COMPLETE = "COMPLETE", "Complete"

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="milestones")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PLANNED)

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="project_milestones",
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="project_milestones_created",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="project_milestones_updated",
    )

    class Meta:
        indexes = [
            models.Index(fields=["project", "status"]),
            models.Index(fields=["assigned_to"]),
            models.Index(fields=["due_date"]),
        ]

    def __str__(self) -> str:
        return f"{self.project.name}: {self.title}"
