export const TICKET_STATUSES = [
  'BACKLOG',
  'READY',
  'IN_PROGRESS',
  'IN_REVIEW',
  'DONE',
  'BLOCKED',
  'CANCELLED'
] as const;

export type TicketStatus = typeof TICKET_STATUSES[number];

export const TICKET_PRIORITIES = ['P0', 'P1', 'P2'] as const;
export type TicketPriority = typeof TICKET_PRIORITIES[number];

export const TICKET_TYPES = ['BUG', 'FEATURE', 'TASK'] as const;
export type TicketType = typeof TICKET_TYPES[number];

export const USER_ROLES = {
  MANAGER: 'Manager',
  DEVELOPER: 'Developer',
  REVIEWER: 'Reviewer'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// UI Constants
export const UI_CONSTANTS = {
  SIDEBAR_WIDTH_PX: 280,
  BOARD_HEADER_HEIGHT_PX: 48,
  MODAL_MAX_WIDTH_PX: 896,
} as const;
