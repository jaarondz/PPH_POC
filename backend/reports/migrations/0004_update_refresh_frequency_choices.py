from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("reports", "0003_add_report_fields"),
    ]

    operations = [
        migrations.AlterField(
            model_name="report",
            name="refresh_frequency",
            field=models.CharField(
                blank=True,
                choices=[
                    ("MONTHLY", "Monthly"),
                    ("WEEKLY", "Weekly"),
                    ("DAILY", "Daily"),
                    ("MULTIPLE_DAILY", "Multiple Times Daily"),
                ],
                default="",
                max_length=20,
            ),
        ),
    ]
