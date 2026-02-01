from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("reports", "0002_migrate_report_assets"),
    ]

    operations = [
        migrations.AddField(
            model_name="report",
            name="developer",
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AddField(
            model_name="report",
            name="automation",
            field=models.CharField(
                blank=True,
                choices=[("AUTOMATED", "Automated"), ("MANUAL", "Manual")],
                default="",
                max_length=12,
            ),
        ),
        migrations.AddField(
            model_name="report",
            name="report_type",
            field=models.CharField(
                blank=True,
                choices=[("POWER_BI", "Power BI"), ("EXCEL", "Excel"), ("OTHER", "Other")],
                default="",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="report",
            name="delivery_method",
            field=models.CharField(
                blank=True,
                choices=[
                    ("POWER_BI", "Power BI"),
                    ("AUTOMATED_EMAIL", "Automated Email"),
                    ("MANUAL_EMAIL", "Manual Email"),
                ],
                default="",
                max_length=30,
            ),
        ),
        migrations.AddField(
            model_name="report",
            name="refresh_frequency",
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AlterField(
            model_name="report",
            name="status",
            field=models.CharField(
                choices=[
                    ("PLANNED", "Planned"),
                    ("IN_DEVELOPMENT", "In Development"),
                    ("ACTIVE", "Active"),
                    ("DEPRECATED", "Deprecated"),
                    ("RETIRED", "Retired"),
                ],
                default="ACTIVE",
                max_length=16,
            ),
        ),
    ]
