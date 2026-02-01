from django.db import migrations, models


def set_existing_tasks_bucket(apps, schema_editor):
    ProjectTask = apps.get_model("projects", "ProjectTask")
    ProjectTask.objects.filter(bucket__isnull=True).update(bucket="IN_PROGRESS")


class Migration(migrations.Migration):

    dependencies = [
        ("projects", "0006_rename_projects_pr_project_81b9ba_idx_projects_pr_project_4795b4_idx_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="projecttask",
            name="bucket",
            field=models.CharField(
                choices=[
                    ("TODO", "To-Do"),
                    ("IN_PROGRESS", "In Progress"),
                    ("COMPLETED", "Completed"),
                    ("CANCELLED", "Cancelled"),
                ],
                default="IN_PROGRESS",
                max_length=20,
            ),
        ),
        migrations.RunPython(set_existing_tasks_bucket, migrations.RunPython.noop),
    ]
