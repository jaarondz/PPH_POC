from django.contrib import admin
from .models import OrgUnit

# Register your models here.
@admin.register(OrgUnit)
class OrgUnitAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "created_at", "updated_at")
    search_fields = ("name", "code")
    ordering = ("name",)