from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ("projects", "0004_merge_20260130_2116"),
    ]

    operations = [
        migrations.CreateModel(
            name="ProjectTask",
            fields=[
                ("id", models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("description", models.TextField()),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("NOT_STARTED", "Not Started"),
                            ("IN_PROGRESS", "In Progress"),
                            ("BLOCKED", "Blocked"),
                            ("DONE", "Done"),
                        ],
                        default="NOT_STARTED",
                        max_length=20,
                    ),
                ),
                ("start_date", models.DateField()),
                ("end_date", models.DateField()),
                (
                    "assigned_to",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="project_tasks",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "project",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="tasks",
                        to="projects.project",
                    ),
                ),
            ],
        ),
        migrations.AddIndex(
            model_name="projecttask",
            index=models.Index(fields=["project", "status"], name="projects_pr_project_81b9ba_idx"),
        ),
        migrations.AddIndex(
            model_name="projecttask",
            index=models.Index(fields=["assigned_to"], name="projects_pr_assigned_5d0c8b_idx"),
        ),
    ]
