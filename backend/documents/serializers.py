from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    ALLOWED_EXTENSIONS = {".pdf", ".docx", ".xlsx", ".csv", ".txt"}
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            "id",
            "title",
            "description",
            "category",
            "version",
            "file",
            "file_url",
            "original_filename",
            "content_type",
            "size_bytes",
            "target_type",
            "target_id",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
        read_only_fields = [
            "id",
            "original_filename",
            "content_type",
            "size_bytes",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]

    def get_file_url(self, obj: Document) -> str | None:
        if not obj.file:
            return None
        request = self.context.get("request")
        url = obj.file.url
        if request:
            return request.build_absolute_uri(url)
        return url

    def create(self, validated_data):
        upload = validated_data.get("file")
        if upload:
            name = upload.name or ""
            ext = name.lower().rsplit(".", 1)
            ext = f".{ext[-1]}" if len(ext) == 2 else ""
            if ext not in self.ALLOWED_EXTENSIONS:
                raise serializers.ValidationError(
                    {
                        "file": "Unsupported file type. Allowed: PDF, DOCX, XLSX, CSV, TXT."
                    }
                )
        if upload:
            validated_data["original_filename"] = upload.name
            validated_data["content_type"] = getattr(upload, "content_type", "") or ""
            validated_data["size_bytes"] = getattr(upload, "size", 0) or 0
        return super().create(validated_data)
