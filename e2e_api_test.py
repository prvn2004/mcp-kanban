import sys
from fastapi.testclient import TestClient
from src.api import app

client = TestClient(app)

def run_tests():
    # 1. Projects
    print("Testing Projects API...")
    res = client.post("/api/projects", json={
        "id": "QA-API-PROJ-1",
        "title": "API QA Project",
        "summary": "Summary",
        "documentation": "Docs",
        "role": "Manager"
    })
    assert res.status_code == 200, res.text
    
    res = client.get("/api/projects/QA-API-PROJ-1")
    assert res.status_code == 200, res.text
    
    res = client.put("/api/projects/QA-API-PROJ-1", json={
        "title": "API QA Project updated",
        "summary": "Summary updated",
        "role": "Manager"
    })
    assert res.status_code == 200, res.text
    
    res = client.put("/api/projects/QA-API-PROJ-1/docs", json={
        "documentation": "Docs updated",
        "role": "Manager"
    })
    assert res.status_code == 200, res.text
    
    res = client.get("/api/projects")
    assert res.status_code == 200, res.text
    
    print("Creating feature via service for API test...")
    from src.services.kanban_service import KanbanService
    KanbanService.create_feature("QA-API-FEAT-1", "QA-API-PROJ-1", "Feature", "Sum", "Owner", "Manager")
    KanbanService.create_subfeature("QA-API-SUB-1", "QA-API-FEAT-1", "Sub", "Sum", "Manager")
    KanbanService.create_ticket("QA-API-TKT-1", "QA-API-SUB-1", "Tkt", "TASK", "P1", "Sum", "Ctx", [], "Manager")
    KanbanService.add_ticket_task("QA-API-TKT-1", "A task", "Manager")
    
    print("Testing Features API...")
    res = client.get("/api/features")
    assert res.status_code == 200, res.text
    
    res = client.get("/api/features/QA-API-FEAT-1")
    assert res.status_code == 200, res.text
    
    res = client.put("/api/features/QA-API-FEAT-1", json={
        "title": "Updated feat", "summary": "Sum", "role": "Manager"
    })
    assert res.status_code == 200, res.text
    
    print("Testing Subfeatures API...")
    res = client.get("/api/subfeatures")
    assert res.status_code == 200, res.text
    
    res = client.get("/api/subfeatures/QA-API-SUB-1")
    assert res.status_code == 200, res.text
    
    res = client.put("/api/subfeatures/QA-API-SUB-1", json={
        "title": "Updated sub", "summary": "Sum", "role": "Manager"
    })
    assert res.status_code == 200, res.text
    
    print("Testing Tickets API...")
    res = client.get("/api/tickets")
    assert res.status_code == 200, res.text
    
    res = client.put("/api/tickets/QA-API-TKT-1", json={
        "title": "Updated tkt", "type": "TASK", "priority": "P2", "summary": "Sum", "context": "Ctx", "role": "Manager"
    })
    assert res.status_code == 200, res.text
    
    res = client.put("/api/tickets/QA-API-TKT-1/status", json={
        "status": "IN_PROGRESS", "role": "Manager", "note": "Going"
    })
    assert res.status_code == 200, res.text
    
    res = client.put("/api/tickets/QA-API-TKT-1/tasks/check", json={
        "task_index": 0, "role": "Manager"
    })
    assert res.status_code == 200, res.text
    
    res = client.post("/api/tickets/QA-API-TKT-1/notes", json={
        "content": "Note", "role": "Manager"
    })
    assert res.status_code == 200, res.text
    
    print("Testing Deletes API...")
    res = client.delete("/api/tickets/QA-API-TKT-1?role=Manager")
    assert res.status_code == 200, res.text
    
    res = client.delete("/api/subfeatures/QA-API-SUB-1?role=Manager")
    assert res.status_code == 200, res.text
    
    res = client.delete("/api/features/QA-API-FEAT-1?role=Manager")
    assert res.status_code == 200, res.text
    
    print("All E2E API tests passed successfully!")

if __name__ == "__main__":
    run_tests()
