ROLE_ADMIN = "ADMIN"
ROLE_PORTFOLIO_OWNER = "PORTFOLIO_OWNER"
ROLE_PORTFOLIO_VIEWER = "PORTFOLIO_VIEWER"
ROLE_ASSET_MANAGER = "ASSET_MANAGER"
ROLE_PROJECT_MANAGER = "PROJECT_MANAGER"
ROLE_TEAM_MEMBER = "TEAM_MEMBER"

ALL_ROLES = [
    ROLE_ADMIN,
    ROLE_PORTFOLIO_OWNER,
    ROLE_PORTFOLIO_VIEWER,
    ROLE_ASSET_MANAGER,
    ROLE_PROJECT_MANAGER,
    ROLE_TEAM_MEMBER,
]

def user_in_role(user, role_name: str) -> bool:
    if not user or not user.is_authenticated:
        return False
    return user.groups.filter(name=role_name).exists()

def is_admin(user) -> bool:
    return user.is_superuser or user_in_role(user, ROLE_ADMIN)

def is_portfolio_owner(user) -> bool:
    return user_in_role(user, ROLE_PORTFOLIO_OWNER)

def is_portfolio_viewer(user) -> bool:
    return user_in_role(user, ROLE_PORTFOLIO_VIEWER)

def can_modify_all(user) -> bool:
    return is_admin(user) or is_portfolio_owner(user)
