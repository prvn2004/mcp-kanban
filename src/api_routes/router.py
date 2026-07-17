import time
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException

from src.services.kanban_service import KanbanService
from src.api_routes.models import (
    FeatureUpdate, SubfeatureUpdate, TicketUpdate, StatusUpdate, TaskCheck, NoteData
)

router = APIRouter()

@router.get("/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy", "timestamp": time.time()}

# --- Features ---

@router.get("/features")
def get_features():
    return KanbanService.list_features()

@router.get("/features/{feature_id}")
def get_feature(feature_id: str):
    feat = KanbanService.get_feature(feature_id)
    if not feat:
        raise HTTPException(status_code=404, detail="Feature not found")
    return feat

@router.put("/features/{feature_id}")
def update_feature(feature_id: str, update: FeatureUpdate):
    return KanbanService.update_feature(feature_id, update.title, update.summary, update.role)

# --- Subfeatures ---

@router.get("/subfeatures")
def get_subfeatures(parent_id: Optional[str] = None):
    return KanbanService.list_subfeatures(parent_id)

@router.get("/subfeatures/{subfeature_id}")
def get_subfeature(subfeature_id: str):
    sub = KanbanService.get_subfeature(subfeature_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Subfeature not found")
    return sub

@router.put("/subfeatures/{subfeature_id}")
def update_subfeature(subfeature_id: str, update: SubfeatureUpdate):
    return KanbanService.update_subfeature(subfeature_id, update.title, update.summary, update.role)

# --- Tickets ---

@router.get("/tickets")
def get_tickets(
    status: Optional[str] = None, 
    assigned_to: Optional[str] = None,
    priority: Optional[str] = None,
    type: Optional[str] = None,
    parent_id: Optional[str] = None,
    search: Optional[str] = None
):
    return KanbanService.list_tickets(status, assigned_to, priority, type, parent_id, search)

@router.put("/tickets/{ticket_id}")
def update_ticket(ticket_id: str, update: TicketUpdate):
    return KanbanService.update_ticket(ticket_id, update.title, update.type, update.priority, update.summary, update.context, update.role)

@router.put("/tickets/{ticket_id}/status")
def update_status(ticket_id: str, update: StatusUpdate):
    return KanbanService.update_ticket_status(ticket_id, update.status, update.role, update.note)

@router.put("/tickets/{ticket_id}/tasks/check")
def check_task(ticket_id: str, update: TaskCheck):
    return KanbanService.check_ticket_task(ticket_id, update.task_index, update.role)

@router.post("/tickets/{ticket_id}/notes")
def add_note(ticket_id: str, data: NoteData):
    KanbanService.add_ticket_note(ticket_id, data.content, data.role)
    return KanbanService.get_ticket(ticket_id)
