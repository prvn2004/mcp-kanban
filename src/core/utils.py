from src.constants import TicketStatus, UserRole
from .exceptions import AuthorizationError

def validate_transition(current_status: str, new_status: str, role: str) -> bool:
    valid_transitions = {
        TicketStatus.BACKLOG: {TicketStatus.READY},
        TicketStatus.READY: {TicketStatus.IN_PROGRESS},
        TicketStatus.IN_PROGRESS: {TicketStatus.IN_REVIEW, TicketStatus.BLOCKED},
        TicketStatus.IN_REVIEW: {TicketStatus.DONE, TicketStatus.IN_PROGRESS},
        TicketStatus.BLOCKED: {TicketStatus.IN_PROGRESS, TicketStatus.READY}
    }
    
    if role == UserRole.MANAGER:
        return True
        
    if new_status in [TicketStatus.CANCELLED, TicketStatus.DONE]:
        if role == UserRole.REVIEWER and current_status == TicketStatus.IN_REVIEW and new_status == TicketStatus.DONE:
            return True
        return False
        
    if current_status in valid_transitions and new_status in valid_transitions[current_status]:
        if role == UserRole.DEVELOPER and new_status in [TicketStatus.IN_PROGRESS, TicketStatus.IN_REVIEW, TicketStatus.BLOCKED]:
            return True
        if role == UserRole.REVIEWER and new_status in [TicketStatus.DONE, TicketStatus.IN_PROGRESS]:
            return True
            
    return False

def verify_manager_role(role: str):
    if role != UserRole.MANAGER:
        raise AuthorizationError("Only Manager can perform this action.")

def verify_developer_or_manager_role(role: str):
    if role not in [UserRole.MANAGER, UserRole.DEVELOPER]:
        raise AuthorizationError("Only Developer or Manager can perform this action.")
