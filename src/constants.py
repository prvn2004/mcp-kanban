class TicketStatus:
    BACKLOG = 'BACKLOG'
    READY = 'READY'
    IN_PROGRESS = 'IN_PROGRESS'
    IN_REVIEW = 'IN_REVIEW'
    DONE = 'DONE'
    BLOCKED = 'BLOCKED'
    CANCELLED = 'CANCELLED'

    ALL = [BACKLOG, READY, IN_PROGRESS, IN_REVIEW, DONE, BLOCKED, CANCELLED]

class UserRole:
    MANAGER = 'Manager'
    DEVELOPER = 'Developer'
    REVIEWER = 'Reviewer'

    ALL = [MANAGER, DEVELOPER, REVIEWER]

class TicketPriority:
    P0 = 'P0'
    P1 = 'P1'
    P2 = 'P2'

class TicketType:
    BUG = 'BUG'
    FEATURE = 'FEATURE'
    TASK = 'TASK'
