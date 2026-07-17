import sqlite3
import json
from pathlib import Path
from datetime import datetime
import os
from contextlib import contextmanager
from typing import List, Optional, Dict, Any

DB_PATH = Path(__file__).parent.parent / 'db' / 'tickets.db'
SCHEMA_PATH = Path(__file__).parent.parent / 'db' / 'schema.sql'

# Domain Exceptions
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

@contextmanager
def get_db():
    """Context manager for SQLite connections."""
    os.makedirs(DB_PATH.parent, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    
    # Initialize schema if new
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='tickets'")
    if not cursor.fetchone():
        with open(SCHEMA_PATH, 'r') as f:
            cursor.executescript(f.read())
        conn.commit()
    
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

# Helper functions for Role enforcement
def validate_transition(current_status: str, new_status: str, role: str) -> bool:
    valid_transitions = {
        'BACKLOG': {'READY'},
        'READY': {'IN_PROGRESS'},
        'IN_PROGRESS': {'IN_REVIEW', 'BLOCKED'},
        'IN_REVIEW': {'DONE', 'IN_PROGRESS'},
        'BLOCKED': {'IN_PROGRESS', 'READY'}
    }
    
    if role == 'Manager':
        return True
        
    if new_status in ['CANCELLED', 'DONE']:
        if role == 'Reviewer' and current_status == 'IN_REVIEW' and new_status == 'DONE':
            return True
        return False
        
    if current_status in valid_transitions and new_status in valid_transitions[current_status]:
        if role == 'Developer' and new_status in ['IN_PROGRESS', 'IN_REVIEW', 'BLOCKED']:
            return True
        if role == 'Reviewer' and new_status in ['DONE', 'IN_PROGRESS']:
            return True
            
    return False

# Database CRUD Operations

def create_feature(id: str, title: str, summary: str, owner: str, role: str) -> Dict[str, Any]:
    if role != 'Manager':
        raise AuthorizationError("Only Manager can create features.")
    if not title.strip() or not summary.strip():
        raise ValidationError("Title and summary cannot be empty.")
        
    with get_db() as conn:
        c = conn.cursor()
        c.execute(
            "INSERT INTO features (id, title, summary, owner) VALUES (?, ?, ?, ?)",
            (id, title, summary, owner)
        )
    return get_feature(id)

def get_feature(id: str) -> Optional[Dict[str, Any]]:
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM features WHERE id = ? COLLATE NOCASE", (id,))
        row = c.fetchone()
        return dict(row) if row else None

def list_features() -> List[Dict[str, Any]]:
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM features")
        rows = c.fetchall()
        return [dict(row) for row in rows]

def create_subfeature(id: str, parent_id: str, title: str, summary: str, role: str) -> Dict[str, Any]:
    if role != 'Manager':
        raise AuthorizationError("Only Manager can create subfeatures.")
    if not title.strip() or not summary.strip():
        raise ValidationError("Title and summary cannot be empty.")
        
    with get_db() as conn:
        c = conn.cursor()
        c.execute(
            "INSERT INTO subfeatures (id, parent_feature_id, title, summary) VALUES (?, ?, ?, ?)",
            (id, parent_id, title, summary)
        )
    return get_subfeature(id)

def get_subfeature(id: str) -> Optional[Dict[str, Any]]:
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM subfeatures WHERE id = ? COLLATE NOCASE", (id,))
        row = c.fetchone()
        return dict(row) if row else None

def create_ticket(id: str, parent_id: str, title: str, type: str, priority: str, summary: str, context: str, acceptance_criteria: list, role: str) -> Dict[str, Any]:
    if role != 'Manager':
        raise AuthorizationError("Only Manager can create tickets.")
    if not title.strip():
        raise ValidationError("Ticket title cannot be empty.")
        
    with get_db() as conn:
        c = conn.cursor()
        c.execute(
            """INSERT INTO tickets 
            (id, parent_id, title, type, priority, summary, context, acceptance_criteria, tasks) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (id, parent_id, title, type, priority, summary, context, json.dumps(acceptance_criteria), json.dumps([]))
        )
        
    add_note(id, "Created ticket.", role)
    return get_ticket(id)

def get_ticket(id: str) -> Optional[Dict[str, Any]]:
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM tickets WHERE id = ? COLLATE NOCASE", (id,))
        row = c.fetchone()
        if not row:
            return None
        
        ticket = dict(row)
        ticket['acceptance_criteria'] = json.loads(ticket['acceptance_criteria']) if ticket['acceptance_criteria'] else []
        ticket['tasks'] = json.loads(ticket['tasks']) if ticket['tasks'] else []
        
        c.execute("SELECT created_at, role, content FROM notes WHERE ticket_id = ? COLLATE NOCASE ORDER BY id ASC", (id,))
        ticket['notes'] = [dict(n) for n in c.fetchall()]
        return ticket

def list_tickets(status: str = None, assigned_to: str = None, priority: str = None, type: str = None, parent_id: str = None, search: str = None) -> List[Dict[str, Any]]:
    with get_db() as conn:
        c = conn.cursor()
        query = "SELECT * FROM tickets WHERE 1=1"
        params = []
        if status:
            if status.upper() == 'ACTIVE':
                query += " AND status NOT IN ('DONE', 'CANCELLED')"
            else:
                query += " AND status = ? COLLATE NOCASE"
                params.append(status)
        if assigned_to:
            query += " AND assigned_to = ? COLLATE NOCASE"
            params.append(assigned_to)
        if priority:
            query += " AND priority = ? COLLATE NOCASE"
            params.append(priority)
        if type:
            query += " AND type = ? COLLATE NOCASE"
            params.append(type)
        if parent_id:
            query += " AND parent_id = ? COLLATE NOCASE"
            params.append(parent_id)
        if search:
            query += " AND (title LIKE ? OR summary LIKE ?)"
            params.append(f"%{search}%")
            params.append(f"%{search}%")
            
        c.execute(query, params)
        rows = c.fetchall()
        
        result = []
        for row in rows:
            t = dict(row)
            t['acceptance_criteria'] = json.loads(t['acceptance_criteria']) if t['acceptance_criteria'] else []
            t['tasks'] = json.loads(t['tasks']) if t['tasks'] else []
            result.append(t)
        return result

def update_ticket_status(id: str, new_status: str, role: str, resolution_note: str = None) -> Dict[str, Any]:
    ticket = get_ticket(id)
    if not ticket:
        raise TicketNotFoundError(f"Ticket {id} not found.")
        
    current_status = ticket['status']
    if current_status == new_status:
        return ticket
        
    if not validate_transition(current_status, new_status, role):
        raise InvalidTransitionError(f"Invalid transition from {current_status} to {new_status} for role {role}.")
        
    # IN_REVIEW validation
    if new_status == 'IN_REVIEW':
        tasks = ticket['tasks']
        for task in tasks:
            if not task.get('completed', False):
                raise ValidationError("Cannot transition to IN_REVIEW. Not all tasks are completed.")
                
    with get_db() as conn:
        c = conn.cursor()
        c.execute("UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? COLLATE NOCASE", (new_status.upper(), id))
        
    note = f"Status changed from {current_status} to {new_status}."
    if resolution_note:
        note += f"\nNote: {resolution_note}"
    add_note(id, note, role)
    
    return get_ticket(id)

def add_ticket_task(id: str, description: str, role: str) -> Dict[str, Any]:
    ticket = get_ticket(id)
    if not ticket:
        raise TicketNotFoundError(f"Ticket {id} not found.")
        
    if role not in ['Manager', 'Developer']:
        raise AuthorizationError("Only Manager or Developer can add tasks.")
        
    tasks = ticket['tasks']
    tasks.append({"description": description, "completed": False})
    
    with get_db() as conn:
        c = conn.cursor()
        c.execute("UPDATE tickets SET tasks = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? COLLATE NOCASE", (json.dumps(tasks), id))
        
    add_note(id, f"Added task: {description}", role)
    return get_ticket(id)

def check_ticket_task(id: str, task_index: int, role: str) -> Dict[str, Any]:
    ticket = get_ticket(id)
    if not ticket:
        raise TicketNotFoundError(f"Ticket {id} not found.")
        
    if role not in ['Manager', 'Developer']:
        raise AuthorizationError("Only Manager or Developer can check tasks.")
        
    tasks = ticket['tasks']
    if task_index < 0 or task_index >= len(tasks):
        raise ValidationError(f"Invalid task index {task_index}.")
        
    tasks[task_index]['completed'] = True
    
    with get_db() as conn:
        c = conn.cursor()
        c.execute("UPDATE tickets SET tasks = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? COLLATE NOCASE", (json.dumps(tasks), id))
        
    add_note(id, f"Completed task: {tasks[task_index]['description']}", role)
    return get_ticket(id)

def add_note(ticket_id: str, content: str, role: str):
    with get_db() as conn:
        c = conn.cursor()
        c.execute("SELECT id FROM tickets WHERE id = ? COLLATE NOCASE", (ticket_id,))
        if not c.fetchone():
            raise TicketNotFoundError(f"Ticket {ticket_id} not found.")
            
        c.execute(
            "INSERT INTO notes (ticket_id, role, content) VALUES (?, ?, ?)",
            (ticket_id, role, content)
        )

def assign_ticket(id: str, assigned_to: str, role: str) -> Dict[str, Any]:
    ticket = get_ticket(id)
    if not ticket:
        raise TicketNotFoundError(f"Ticket {id} not found.")
        
    if role == 'Developer':
        if ticket['status'] != 'READY':
            raise ValidationError("Developers can only assign READY tickets to themselves.")
    elif role != 'Manager':
        raise AuthorizationError(f"Role {role} cannot assign tickets.")
        
    with get_db() as conn:
        c = conn.cursor()
        c.execute("UPDATE tickets SET assigned_to = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? COLLATE NOCASE", (assigned_to, id))
        
    add_note(id, f"Ticket assigned to {assigned_to}.", role)
    return get_ticket(id)
