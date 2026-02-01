from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("projects", "0007_projecttask_bucket"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="projecttask",
            name="bucket",
        ),
    ]
