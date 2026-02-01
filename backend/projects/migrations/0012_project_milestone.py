from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ("projects", "0011_project_audit_fields"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="ProjectMilestone",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("title", models.CharField(max_length=200)),
                ("description", models.TextField(blank=True)),
                ("due_date", models.DateField(blank=True, null=True)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("PLANNED", "Planned"),
                            ("IN_PROGRESS", "In Progress"),
                            ("AT_RISK", "At Risk"),
                            ("COMPLETE", "Complete"),
                        ],
                        default="PLANNED",
                        max_length=20,
                    ),
                ),
                (
                    "assigned_to",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="project_milestones",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="project_milestones_created",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "updated_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="project_milestones_updated",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "project",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="milestones",
                        to="projects.project",
                    ),
                ),
            ],
        ),
        migrations.AddIndex(
            model_name="projectmilestone",
            index=models.Index(fields=["project", "status"], name="projects_pr_project_967ad1_idx"),
        ),
        migrations.AddIndex(
            model_name="projectmilestone",
            index=models.Index(fields=["assigned_to"], name="projects_pr_assigned_6428ed_idx"),
        ),
        migrations.AddIndex(
            model_name="projectmilestone",
            index=models.Index(fields=["due_date"], name="projects_pr_due_date_8a6319_idx"),
        ),
    ]
