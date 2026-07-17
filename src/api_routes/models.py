from pydantic import BaseModel, Field
from typing import Optional

class StatusUpdate(BaseModel):
    status: str = Field(..., description="The new status to move to")
    role: str = Field(..., description="Role attempting the transition")
    note: Optional[str] = Field(None, max_length=1000)

class TaskCheck(BaseModel):
    task_index: int = Field(..., ge=0)
    role: str

class NoteData(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)
    role: str

class TicketUpdate(BaseModel):
    title: str
    type: str
    priority: str
    summary: str
    context: str
    role: str

class FeatureUpdate(BaseModel):
    title: str
    summary: str
    role: str

class SubfeatureUpdate(BaseModel):
    title: str
    summary: str
    role: str
