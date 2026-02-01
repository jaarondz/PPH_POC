from django.contrib import admin
from .models import Project, ProjectAssetLink, ProjectTask, ProjectMilestone


class ProjectAssetLinkInline(admin.TabularInline):
    model = ProjectAssetLink
    extra = 1
    autocomplete_fields = ("asset",)
    fields = ("asset", "relationship_type", "notes")
    show_change_link = True


class ProjectTaskInline(admin.TabularInline):
    model = ProjectTask
    extra = 1
    autocomplete_fields = ("assigned_to",)
    fields = ("description", "status", "assigned_to", "start_date", "end_date")
    show_change_link = True


class ProjectMilestoneInline(admin.TabularInline):
    model = ProjectMilestone
    extra = 1
    autocomplete_fields = ("assigned_to",)
    fields = ("title", "status", "assigned_to", "due_date")
    show_change_link = True


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "project_type",
        "status",
        "priority",
        "sponsor",
        "owner",
        "owning_org_unit",
        "start_date",
        "target_end_date",
        "updated_at",
        "assigned_to",
    )
    list_filter = ("project_type", "status", "priority", "owning_org_unit")
    search_fields = ("name", "summary", "sponsor")
    ordering = ("-updated_at", "name")
    inlines = [ProjectAssetLinkInline, ProjectTaskInline, ProjectMilestoneInline]


@admin.register(ProjectAssetLink)
class ProjectAssetLinkAdmin(admin.ModelAdmin):
    list_display = ("project", "relationship_type", "asset", "created_at")
    list_filter = ("relationship_type",)
    search_fields = ("project__name", "asset__name", "notes")
    autocomplete_fields = ("project", "asset")


@admin.register(ProjectTask)
class ProjectTaskAdmin(admin.ModelAdmin):
    list_display = ("project", "status", "assigned_to", "start_date", "end_date", "updated_at")
    list_filter = ("status", "project")
    search_fields = ("project__name", "description", "assigned_to__username")
    autocomplete_fields = ("project", "assigned_to")


@admin.register(ProjectMilestone)
class ProjectMilestoneAdmin(admin.ModelAdmin):
    list_display = ("project", "title", "status", "assigned_to", "due_date", "updated_at")
    list_filter = ("status", "project")
    search_fields = ("project__name", "title", "description")
    autocomplete_fields = ("project", "assigned_to")
