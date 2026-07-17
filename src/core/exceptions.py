class TicketError(Exception):
    """Base exception for ticket operations."""
    pass

class TicketNotFoundError(TicketError):
    pass

class InvalidTransitionError(TicketError):
    pass

class AuthorizationError(TicketError):
    pass

class ValidationError(TicketError):
    pass
