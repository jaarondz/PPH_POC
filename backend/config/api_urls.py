from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users.api import LoginView, MeView

from assets.views import AssetViewSet
from projects.views import (
    ProjectViewSet,
    ProjectAssetLinkViewSet,
    ProjectTaskViewSet,
    ProjectMilestoneViewSet,
)
from users.views import UserViewSet
from outcomes.views import (
    AccomplishmentViewSet,
    AccomplishmentAssetLinkViewSet,
    AccomplishmentProjectLinkViewSet,
)
from reports.views import ReportViewSet, ReportAssetLinkViewSet, ReportAccomplishmentLinkViewSet
from documents.views import DocumentViewSet

router = DefaultRouter()
router.register(r"assets", AssetViewSet)
router.register(r"projects", ProjectViewSet)
router.register(r"project-asset-links", ProjectAssetLinkViewSet)
router.register(r"project-tasks", ProjectTaskViewSet)
router.register(r"project-milestones", ProjectMilestoneViewSet)
router.register(r"users", UserViewSet)
router.register(r"accomplishments", AccomplishmentViewSet)
router.register(r"reports", ReportViewSet)
router.register(r"documents", DocumentViewSet)
#router.register(r"accomplishment-asset-links", AccomplishmentAssetLinkViewSet)
#router.register(r"accomplishment-project-links", AccomplishmentProjectLinkViewSet)
router.register(r"accomplishment-asset-links", AccomplishmentAssetLinkViewSet, basename="accomplishment-asset-link")
router.register(r"accomplishment-project-links", AccomplishmentProjectLinkViewSet, basename="accomplishment-project-link")
router.register(r"report-asset-links", ReportAssetLinkViewSet, basename="report-asset-link")
router.register(r"report-accomplishment-links", ReportAccomplishmentLinkViewSet, basename="report-accomplishment-link")


urlpatterns = [
    path("", include(router.urls)),
    path("auth/login/", LoginView.as_view()),
    path("auth/me/", MeView.as_view()),
]
