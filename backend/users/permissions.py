from rest_framework.permissions import BasePermission, SAFE_METHODS
from .roles import (
    can_modify_all,
    user_in_role,
    ROLE_ASSET_MANAGER,
    ROLE_PROJECT_MANAGER,
)

class CanViewEverything(BasePermission):
    """
    Used when your queryset already limits visibility.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


class AssetPermission(BasePermission):
    """
    - Everyone authenticated can view what queryset returns
    - ADMIN/PORTFOLIO_OWNER can modify any
    - ASSET_MANAGER can modify only if assigned_to == user
    - Others cannot modify
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        if can_modify_all(request.user):
            return True

        if user_in_role(request.user, ROLE_ASSET_MANAGER):
            return obj.assigned_to_id == request.user.id

        return False


class ProjectPermission(BasePermission):
    """
    - Everyone authenticated can view what queryset returns
    - ADMIN/PORTFOLIO_OWNER can modify any
    - PROJECT_MANAGER can modify only if assigned_to == user
    - Others cannot modify
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        if can_modify_all(request.user):
            return True

        if user_in_role(request.user, ROLE_PROJECT_MANAGER):
            return obj.assigned_to_id == request.user.id

        return False


class ProjectChildPermission(BasePermission):
    """
    Permission for objects related to a project (e.g., milestones).
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        if can_modify_all(request.user):
            return True

        if user_in_role(request.user, ROLE_PROJECT_MANAGER):
            project = getattr(obj, "project", None)
            return project and project.assigned_to_id == request.user.id

        return False


class AccomplishmentPermission(BasePermission):
    """
    Everyone authenticated can view all accomplishments.
    Only ADMIN/PORTFOLIO_OWNER can modify.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return can_modify_all(request.user)


class ReportPermission(BasePermission):
    """
    - Everyone authenticated can view what queryset returns
    - ADMIN/PORTFOLIO_OWNER can modify any
    - ASSET_MANAGER can modify only if assigned_to == user
    - Others cannot modify
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        if can_modify_all(request.user):
            return True

        if user_in_role(request.user, ROLE_ASSET_MANAGER):
            return obj.assigned_to_id == request.user.id

        return False
