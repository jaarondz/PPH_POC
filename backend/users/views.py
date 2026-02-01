from django.contrib.auth import get_user_model
from rest_framework import viewsets
from .permissions import CanViewEverything
from .serializers import UserSummarySerializer

User = get_user_model()


class UserViewSet(viewsets.ReadOnlyModelViewSet):
	queryset = User.objects.all().order_by("username")
	serializer_class = UserSummarySerializer
	permission_classes = [CanViewEverything]
