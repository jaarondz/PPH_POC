from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from assets.models import Asset
from projects.models import Project
from outcomes.models import Accomplishment
from reports.models import Report
from users.roles import can_modify_all, user_in_role, ROLE_PORTFOLIO_VIEWER, ROLE_ASSET_MANAGER


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def executive_summary(request):
    """
    High-level executive summary across all modules:
    - Assets
    - Projects
    - Reports
    - Accomplishments
    """
    user = request.user
    team_filter = request.query_params.get("owning_team", "").strip() or None

    # Determine if user can view all data
    can_view_all = can_modify_all(user) or user_in_role(user, ROLE_PORTFOLIO_VIEWER) or user_in_role(user, ROLE_ASSET_MANAGER)

    # Assets Summary
    if can_view_all:
        assets_qs = Asset.objects.exclude(asset_type="REPORT")
    else:
        assets_qs = Asset.objects.filter(assigned_to=user).exclude(asset_type="REPORT")
    
    assets_summary = {
        "total": assets_qs.count(),
        "by_status": dict(assets_qs.values('status').annotate(count=Count('id')).values_list('status', 'count')),
        "by_type": dict(assets_qs.values('asset_type').annotate(count=Count('id')).values_list('asset_type', 'count')),
        "by_scope": dict(assets_qs.values('scope').annotate(count=Count('id')).values_list('scope', 'count')),
        "risk_counts": {
            "security": assets_qs.filter(risk_security=True).count(),
            "privacy": assets_qs.filter(risk_privacy=True).count(),
            "compliance": assets_qs.filter(risk_compliance=True).count(),
            "any_risk": assets_qs.filter(Q(risk_security=True) | Q(risk_privacy=True) | Q(risk_compliance=True)).count(),
        }
    }

    # Projects Summary
    if can_view_all:
        projects_qs = Project.objects.all()
    else:
        projects_qs = Project.objects.filter(assigned_to=user)

    if team_filter:
        projects_qs = projects_qs.filter(owning_team=team_filter)
    
    projects_summary = {
        "total": projects_qs.count(),
        "by_status": dict(projects_qs.values('status').annotate(count=Count('id')).values_list('status', 'count')),
        "by_priority": dict(projects_qs.values('priority').annotate(count=Count('id')).values_list('priority', 'count')),
        "by_owning_team": dict(projects_qs.values('owning_team').annotate(count=Count('id')).values_list('owning_team', 'count')),
        "by_team": dict(projects_qs.values('team__name').annotate(count=Count('id')).values_list('team__name', 'count')),
        "by_owner": dict(projects_qs.values('owner__username').annotate(count=Count('id')).values_list('owner__username', 'count')),
        "active": projects_qs.filter(status="ACTIVE").count(),
        "blocked": projects_qs.filter(status="BLOCKED").count(),
        "completed": projects_qs.filter(status="DONE").count(),
    }

    # Reports Summary
    if can_view_all:
        reports_qs = Report.objects.all()
    else:
        reports_qs = Report.objects.filter(assigned_to=user)
    
    reports_summary = {
        "total": reports_qs.count(),
        "by_status": dict(reports_qs.values('status').annotate(count=Count('id')).values_list('status', 'count')),
        "active": reports_qs.filter(status="ACTIVE").count(),
        "in_development": reports_qs.filter(status="IN_DEVELOPMENT").count(),
        "planned": reports_qs.filter(status="PLANNED").count(),
    }

    # Accomplishments Summary
    if can_view_all:
        accomplishments_qs = Accomplishment.objects.all()
    else:
        # Filter by team or created_by since there's no assigned_to field
        accomplishments_qs = Accomplishment.objects.filter(
            Q(created_by=user) | Q(team__members__user=user)
        ).distinct()
    
    accomplishments_summary = {
        "total": accomplishments_qs.count(),
        "by_impact_type": dict(accomplishments_qs.values('impact_type').annotate(count=Count('id')).values_list('impact_type', 'count')),
        "by_team": dict(accomplishments_qs.values('team__name').annotate(count=Count('id')).values_list('team__name', 'count')),
    }

    return Response({
        "assets": assets_summary,
        "projects": projects_summary,
        "reports": reports_summary,
        "accomplishments": accomplishments_summary,
    })
