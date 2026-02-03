from django.contrib.auth import get_user_model
from rest_framework import viewsets
from .permissions import CanViewEverything
from .serializers import (
	UserSummarySerializer,
	TeamSerializer,
	TeamMembershipSerializer,
)
from .models import Team, TeamMembership

User = get_user_model()


class UserViewSet(viewsets.ReadOnlyModelViewSet):
	queryset = User.objects.all().order_by("username")
	serializer_class = UserSummarySerializer
	permission_classes = [CanViewEverything]


class TeamViewSet(viewsets.ModelViewSet):
	queryset = Team.objects.all().order_by("name")
	serializer_class = TeamSerializer
	permission_classes = [CanViewEverything]


class TeamMembershipViewSet(viewsets.ModelViewSet):
	queryset = TeamMembership.objects.select_related("team", "user").all()
	serializer_class = TeamMembershipSerializer
	permission_classes = [CanViewEverything]
