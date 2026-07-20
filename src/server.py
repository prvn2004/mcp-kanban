import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from mcp.server.fastmcp import FastMCP
from typing import List, Optional, Dict, Any
from src.services.kanban_service import KanbanService

# Initialize FastMCP Server
mcp = FastMCP("Ticket Manager MCP Server")

@mcp.tool()
def create_project(id: str, title: str, summary: str, documentation: str, owner: str, role: str) -> Dict[str, Any]:
    """
    Create a new project.
    A project is the highest-level container that groups features together.
    Requires role = 'Manager'.
    """
    return KanbanService.create_project(id, title, summary, documentation, owner, role)

@mcp.tool()
def get_project(id: str) -> Optional[Dict[str, Any]]:
    """Retrieve details of a specific project by its ID, including documentation."""
    return KanbanService.get_project(id)

@mcp.tool()
def list_projects() -> List[Dict[str, Any]]:
    """List all projects available in the system."""
    return KanbanService.list_projects()

@mcp.tool()
def update_project_docs(id: str, documentation: str, role: str) -> Dict[str, Any]:
    """
    Update the documentation file contents of a project.
    This is where all high-level information and context about the project is stored.
    Requires role = 'Manager'.
    """
    return KanbanService.update_project_docs(id, documentation, role)

@mcp.tool()
def create_feature(id: str, project_id: str, title: str, summary: str, owner: str, role: str) -> Dict[str, Any]:
    """
    Create a new parent feature inside a project. 
    A feature represents a large grouping of work (e.g. RAP, SEC).
    This tool is primarily used when setting up new epics.
    Requires role = 'Manager'.
    """
    return KanbanService.create_feature(id, project_id, title, summary, owner, role)

@mcp.tool()
def get_feature(id: str) -> Optional[Dict[str, Any]]:
    """Retrieve details of a specific feature by its ID."""
    return KanbanService.get_feature(id)

@mcp.tool()
def list_features(project_id: str = None) -> List[Dict[str, Any]]:
    """List features/epics available in the system. Optionally filter by project_id."""
    return KanbanService.list_features(project_id)

@mcp.tool()
def create_subfeature(id: str, parent_id: str, title: str, summary: str, role: str) -> Dict[str, Any]:
    """
    Create a new subfeature to break down a large feature into smaller logical blocks.
    Requires role = 'Manager'.
    """
    return KanbanService.create_subfeature(id, parent_id, title, summary, role)

@mcp.tool()
def get_subfeature(id: str) -> Optional[Dict[str, Any]]:
    """Retrieve details of a specific subfeature by its ID."""
    return KanbanService.get_subfeature(id)

@mcp.tool()
def create_ticket(id: str, parent_id: str, title: str, type: str, priority: str, summary: str, context: str, acceptance_criteria: List[str], role: str) -> Dict[str, Any]:
    """
    Create a new ticket.
    Requires role = 'Manager'.
    id: Unique ID like RAP-AUTH-001.
    type: TASK | BUG | CHORE | RESEARCH | REVIEW | HOTFIX
    priority: P0 (Critical) | P1 (High) | P2 (Medium) | P3 (Low)
    parent_id: ID of the feature or subfeature this ticket belongs to.
    """
    return KanbanService.create_ticket(id, parent_id, title, type, priority, summary, context, acceptance_criteria, role)

@mcp.tool()
def get_ticket(id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve full details of a specific ticket by its ID (e.g. 'RAP-AUTH-001').
    This returns the ticket's title, summary, status, checklist tasks, and all historical notes/comments.
    Use this when you know the exact ticket ID you want to work on.
    """
    return KanbanService.get_ticket(id)

@mcp.tool()
def list_tickets(status: str = None, assigned_to: str = None, priority: str = None, type: str = None, parent_id: str = None, search: str = None) -> List[Dict[str, Any]]:
    """
    Search and filter tickets in the system. Use this to find tickets to work on.
    All parameters are optional filters. Use minimal filters for broader results.
    status: Filter by status ('BACKLOG', 'READY', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED', 'CANCELLED') or use 'ACTIVE' to get all unresolved tickets.
    assigned_to: Filter by the assignee's name (e.g., 'QA-Bot').
    priority: Filter by severity/priority (e.g., 'P0', 'P1', 'P2', 'P3').
    type: Filter by ticket type (e.g., 'BUG', 'TASK').
    parent_id: Filter tickets belonging to a specific feature/subfeature (e.g., 'RAP', 'SEC').
    search: Text search within the ticket title or summary.
    """
    return KanbanService.list_tickets(status, assigned_to, priority, type, parent_id, search)

@mcp.tool()
def update_ticket_status(id: str, new_status: str, role: str, resolution_note: str = None) -> Dict[str, Any]:
    """
    Update the status of a ticket to move it across the Kanban board.
    Enforces valid transitions based on role.
    Developer can transition: READY -> IN_PROGRESS -> IN_REVIEW or BLOCKED.
    Reviewer can transition: IN_REVIEW -> DONE or IN_PROGRESS.
    Manager can transition to ANY status.
    If moving to BLOCKED or rejecting from IN_REVIEW, you must provide a resolution_note explaining why.
    """
    return KanbanService.update_ticket_status(id, new_status, role, resolution_note)

@mcp.tool()
def add_ticket_task(id: str, description: str, role: str) -> Dict[str, Any]:
    """Add a sub-task (checklist item) to an existing ticket."""
    return KanbanService.add_ticket_task(id, description, role)

@mcp.tool()
def check_ticket_task(id: str, task_index: int, role: str) -> Dict[str, Any]:
    """
    Mark a ticket's sub-task as completed. 
    task_index is the 0-based index of the task in the ticket's task list.
    Requires role Developer or Manager.
    All tasks must be checked off before transitioning to IN_REVIEW.
    """
    return KanbanService.check_ticket_task(id, task_index, role)

@mcp.tool()
def add_ticket_note(id: str, content: str, role: str) -> Dict[str, Any]:
    """
    Add a comment/note to a ticket's activity log.
    Highly recommended when making discoveries, asking questions, or logging work done.
    """
    return KanbanService.add_ticket_note(id, content, role)

@mcp.tool()
def assign_ticket(id: str, assignee: str, role: str) -> Dict[str, Any]:
    """
    Assign a ticket to someone.
    Developers can only assign READY tickets to themselves.
    Managers can assign to anyone.
    """
    return KanbanService.assign_ticket(id, assignee, role)

@mcp.tool()
def delete_feature(id: str, role: str) -> bool:
    """Delete a feature by its ID. Requires Manager role."""
    return KanbanService.delete_feature(id, role)

@mcp.tool()
def delete_subfeature(id: str, role: str) -> bool:
    """Delete a subfeature by its ID. Requires Manager role."""
    return KanbanService.delete_subfeature(id, role)

@mcp.tool()
def delete_ticket(id: str, role: str) -> bool:
    """Delete a ticket by its ID. Requires Manager role."""
    return KanbanService.delete_ticket(id, role)

if __name__ == "__main__":
    mcp.run()
