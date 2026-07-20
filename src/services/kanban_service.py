import json
from typing import List, Optional, Dict, Any
from src.db.connection import get_db
from src.db.queries import Queries, build_list_tickets_query
from src.core.exceptions import TicketNotFoundError, ValidationError
from src.core.utils import validate_transition, verify_manager_role, verify_developer_or_manager_role
from src.constants import TicketStatus, UserRole

class KanbanService:

    @staticmethod
    def get_project(id: str) -> Optional[Dict[str, Any]]:
        with get_db() as conn:
            c = conn.cursor()
            c.execute(Queries.GET_PROJECT, (id,))
            row = c.fetchone()
            return dict(row) if row else None

    @staticmethod
    def list_projects() -> List[Dict[str, Any]]:
        with get_db() as conn:
            c = conn.cursor()
            c.execute(Queries.LIST_PROJECTS)
            return [dict(row) for row in c.fetchall()]

    @staticmethod
    def create_project(id: str, title: str, summary: str, documentation: str, owner: str, role: str) -> Dict[str, Any]:
        verify_manager_role(role)
        if not title.strip():
            raise ValidationError("Title cannot be empty.")
            
        with get_db() as conn:
            c = conn.cursor()
            c.execute(Queries.CREATE_PROJECT, (id, title, summary, documentation, owner))
        return KanbanService.get_project(id)

    @staticmethod
    def update_project(id: str, title: str, summary: str, role: str) -> Dict[str, Any]:
        verify_manager_role(role)
        if not KanbanService.get_project(id):
            raise TicketNotFoundError(f"Project {id} not found.")
            
        with get_db() as conn:
            c = conn.cursor()
            c.execute(Queries.UPDATE_PROJECT, (title, summary, id))
        return KanbanService.get_project(id)

    @staticmethod
    def update_project_docs(id: str, documentation: str, role: str) -> Dict[str, Any]:
        verify_manager_role(role)
        if not KanbanService.get_project(id):
            raise TicketNotFoundError(f"Project {id} not found.")
            
        with get_db() as conn:
            c = conn.cursor()
            c.execute(Queries.UPDATE_PROJECT_DOCS, (documentation, id))
        return KanbanService.get_project(id)

    @staticmethod
    def get_feature(id: str) -> Optional[Dict[str, Any]]:
        with get_db() as conn:
            c = conn.cursor()
            c.execute(Queries.GET_FEATURE, (id,))
            row = c.fetchone()
            return dict(row) if row else None

    @staticmethod
    def list_features(project_id: str = None) -> List[Dict[str, Any]]:
        with get_db() as conn:
            c = conn.cursor()
            if project_id:
                c.execute(Queries.LIST_FEATURES_BY_PROJECT, (project_id,))
            else:
                c.execute(Queries.LIST_FEATURES)
            return [dict(row) for row in c.fetchall()]

    @staticmethod
    def create_feature(id: str, project_id: str, title: str, summary: str, owner: str, role: str) -> Dict[str, Any]:
        verify_manager_role(role)
        if not title.strip() or not summary.strip():
            raise ValidationError("Title and summary cannot be empty.")
            
        with get_db() as conn:
            c = conn.cursor()
            c.execute(Queries.CREATE_FEATURE, (id, project_id, title, summary, owner))
        return KanbanService.get_feature(id)

    @staticmethod
    def update_feature(id: str, title: str, summary: str, role: str) -> Dict[str, Any]:
        verify_manager_role(role)
        if not KanbanService.get_feature(id):
            raise TicketNotFoundError(f"Feature {id} not found.")
            
        with get_db() as conn:
            c = conn.cursor()
            c.execute(Queries.UPDATE_FEATURE, (title, summary, id))
        return KanbanService.get_feature(id)

    @staticmethod
    def get_subfeature(id: str) -> Optional[Dict[str, Any]]:
        with get_db() as conn:
            c = conn.cursor()
            c.execute(Queries.GET_SUBFEATURE, (id,))
            row = c.fetchone()
            return dict(row) if row else None

    @staticmethod
    def list_subfeatures(parent_id: str = None) -> List[Dict[str, Any]]:
        with get_db() as conn:
            c = conn.cursor()
            if parent_id:
                c.execute(Queries.LIST_SUBFEATURES_BY_PARENT, (parent_id,))
            else:
                c.execute(Queries.LIST_SUBFEATURES)
            return [dict(row) for row in c.fetchall()]

    @staticmethod
    def create_subfeature(id: str, parent_id: str, title: str, summary: str, role: str) -> Dict[str, Any]:
        verify_manager_role(role)
        if not title.strip() or not summary.strip():
            raise ValidationError("Title and summary cannot be empty.")
            
        with get_db() as conn:
            c = conn.cursor()
            c.execute(Queries.CREATE_SUBFEATURE, (id, parent_id, title, summary))
        return KanbanService.get_subfeature(id)

    @staticmethod
    def update_subfeature(id: str, title: str, summary: str, role: str) -> Dict[str, Any]:
        verify_manager_role(role)
        if not KanbanService.get_subfeature(id):
            raise TicketNotFoundError(f"Subfeature {id} not found.")
            
        with get_db() as conn:
            c = conn.cursor()
            c.execute(Queries.UPDATE_SUBFEATURE, (title, summary, id))
        return KanbanService.get_subfeature(id)

    @staticmethod
    def _add_note(id: str, content: str, role: str):
        with get_db() as conn:
            c = conn.cursor()
            c.execute(Queries.ADD_NOTE, (id, role, content))

    @staticmethod
    def get_ticket(id: str) -> Optional[Dict[str, Any]]:
        with get_db() as conn:
            c = conn.cursor()
            c.execute(Queries.GET_TICKET, (id,))
            row = c.fetchone()
            if not row:
                return None
            
            ticket = dict(row)
            ticket['acceptance_criteria'] = json.loads(ticket['acceptance_criteria']) if ticket['acceptance_criteria'] else []
            ticket['tasks'] = json.loads(ticket['tasks']) if ticket['tasks'] else []
            
            c.execute(Queries.GET_TICKET_NOTES, (id,))
            ticket['notes'] = [dict(n) for n in c.fetchall()]
            return ticket

    @staticmethod
    def list_tickets(status: str = None, assigned_to: str = None, priority: str = None, type: str = None, parent_id: str = None, search: str = None) -> List[Dict[str, Any]]:
        query, params = build_list_tickets_query(status, assigned_to, priority, type, parent_id, search)
        
        with get_db() as conn:
            c = conn.cursor()
            c.execute(query, params)
            rows = c.fetchall()
            
            result = []
            for row in rows:
                t = dict(row)
                t['acceptance_criteria'] = json.loads(t['acceptance_criteria']) if t['acceptance_criteria'] else []
                t['tasks'] = json.loads(t['tasks']) if t['tasks'] else []
                
                c.execute(Queries.GET_TICKET_NOTES, (t['id'],))
                t['notes'] = [dict(n) for n in c.fetchall()]
                result.append(t)
            return result

    @staticmethod
    def create_ticket(id: str, parent_id: str, title: str, type: str, priority: str, summary: str, context: str, acceptance_criteria: list, role: str) -> Dict[str, Any]:
        verify_manager_role(role)
        if not title.strip():
            raise ValidationError("Ticket title cannot be empty.")
            
        with get_db() as conn:
            c = conn.cursor()
            c.execute(
                Queries.CREATE_TICKET,
                (id, parent_id, title, type, priority, summary, context, json.dumps(acceptance_criteria), json.dumps([]))
            )
            
        KanbanService._add_note(id, "Created ticket.", role)
        return KanbanService.get_ticket(id)

    @staticmethod
    def update_ticket(id: str, title: str, type: str, priority: str, summary: str, context: str, role: str) -> Dict[str, Any]:
        verify_developer_or_manager_role(role)
        if not KanbanService.get_ticket(id):
            raise TicketNotFoundError(f"Ticket {id} not found.")
            
        with get_db() as conn:
            c = conn.cursor()
            c.execute(Queries.UPDATE_TICKET, (title, type, priority, summary, context, id))
            
        KanbanService._add_note(id, "Updated ticket details.", role)
        return KanbanService.get_ticket(id)

    @staticmethod
    def update_ticket_status(id: str, new_status: str, role: str, resolution_note: str = None) -> Dict[str, Any]:
        ticket = KanbanService.get_ticket(id)
        if not ticket:
            raise TicketNotFoundError(f"Ticket {id} not found.")
            
        current_status = ticket['status']
        if current_status == new_status:
            return ticket
            
        if not validate_transition(current_status, new_status, role):
            from src.core.exceptions import InvalidTransitionError
            raise InvalidTransitionError(f"Invalid transition from {current_status} to {new_status} for role {role}.")
            
        if new_status == TicketStatus.IN_REVIEW:
            tasks = ticket['tasks']
            for task in tasks:
                if not task.get('completed', False):
                    raise ValidationError("Cannot transition to IN_REVIEW. Not all tasks are completed.")
                    
        with get_db() as conn:
            c = conn.cursor()
            c.execute(Queries.UPDATE_TICKET_STATUS, (new_status.upper(), id))
            
        note = f"Status changed from {current_status} to {new_status}."
        if resolution_note:
            note += f"\nNote: {resolution_note}"
        KanbanService._add_note(id, note, role)
        
        return KanbanService.get_ticket(id)

    @staticmethod
    def add_ticket_task(id: str, description: str, role: str) -> Dict[str, Any]:
        verify_developer_or_manager_role(role)
        ticket = KanbanService.get_ticket(id)
        if not ticket:
            raise TicketNotFoundError(f"Ticket {id} not found.")
            
        tasks = ticket['tasks']
        tasks.append({"description": description, "completed": False})
        
        with get_db() as conn:
            c = conn.cursor()
            c.execute(Queries.UPDATE_TICKET_TASKS, (json.dumps(tasks), id))
            
        KanbanService._add_note(id, f"Added task: {description}", role)
        return KanbanService.get_ticket(id)

    @staticmethod
    def check_ticket_task(id: str, task_index: int, role: str) -> Dict[str, Any]:
        verify_developer_or_manager_role(role)
        ticket = KanbanService.get_ticket(id)
        if not ticket:
            raise TicketNotFoundError(f"Ticket {id} not found.")
            
        tasks = ticket['tasks']
        if task_index < 0 or task_index >= len(tasks):
            raise ValidationError(f"Invalid task index {task_index}.")
            
        tasks[task_index]["completed"] = True
        desc = tasks[task_index]["description"]
        
        with get_db() as conn:
            c = conn.cursor()
            c.execute(Queries.UPDATE_TICKET_TASKS, (json.dumps(tasks), id))
            
        KanbanService._add_note(id, f"Completed task: {desc}", role)
        return KanbanService.get_ticket(id)

    @staticmethod
    def add_ticket_note(id: str, content: str, role: str) -> Dict[str, Any]:
        if not KanbanService.get_ticket(id):
            raise TicketNotFoundError(f"Ticket {id} not found.")
            
        KanbanService._add_note(id, content, role)
        return KanbanService.get_ticket(id)

    @staticmethod
    def assign_ticket(id: str, assignee: str, role: str) -> Dict[str, Any]:
        verify_manager_role(role)
        if not KanbanService.get_ticket(id):
            raise TicketNotFoundError(f"Ticket {id} not found.")
            
        with get_db() as conn:
            c = conn.cursor()
            c.execute(Queries.UPDATE_TICKET_ASSIGNEE, (assignee, id))
            
        KanbanService._add_note(id, f"Ticket assigned to {assignee}.", role)
        return KanbanService.get_ticket(id)

    @staticmethod
    def delete_feature(id: str, role: str) -> bool:
        verify_manager_role(role)
        if not KanbanService.get_feature(id):
            raise TicketNotFoundError(f"Feature {id} not found.")
            
        with get_db() as conn:
            c = conn.cursor()
            c.execute(Queries.DELETE_TICKETS_BY_FEATURE, (id, id))
            c.execute(Queries.DELETE_SUBFEATURES_BY_PARENT, (id,))
            c.execute(Queries.DELETE_FEATURE, (id,))
        return True

    @staticmethod
    def delete_subfeature(id: str, role: str) -> bool:
        verify_manager_role(role)
        if not KanbanService.get_subfeature(id):
            raise TicketNotFoundError(f"Subfeature {id} not found.")
            
        with get_db() as conn:
            c = conn.cursor()
            c.execute(Queries.DELETE_TICKETS_BY_PARENT, (id,))
            c.execute(Queries.DELETE_SUBFEATURE, (id,))
        return True

    @staticmethod
    def delete_ticket(id: str, role: str) -> bool:
        verify_manager_role(role)
        if not KanbanService.get_ticket(id):
            raise TicketNotFoundError(f"Ticket {id} not found.")
            
        with get_db() as conn:
            c = conn.cursor()
            c.execute(Queries.DELETE_TICKET, (id,))
        return True
