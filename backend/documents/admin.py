from django.contrib import admin
from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("title", "target_type", "target_id", "created_at")
    search_fields = ("title", "description", "original_filename")
    list_filter = ("target_type",)
