from django.db import models
from core.models import UUIDModel, TimeStampedModel


class OrgUnit(UUIDModel, TimeStampedModel):
    """
    Minimal org structure for POC.
    Later: hierarchical org units, cost centers, etc.
    """
    name = models.CharField(max_length=120, unique=True)
    code = models.CharField(max_length=30, blank=True)  # optional short code

    def __str__(self) -> str:
        return self.name
