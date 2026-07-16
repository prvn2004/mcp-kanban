import unittest
import os
import json
from fastapi.testclient import TestClient
from src import db
from src.api import app

class TestTicketManager(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        
        # Test Data
        cls.feature_id = "TEST-FEAT-001"
        cls.ticket_id = "TEST-TKT-001"
        
        # Clean up existing test data if any
        try:
            with db.get_db() as conn:
                c = conn.cursor()
                c.execute("DELETE FROM tickets WHERE id = ?", (cls.ticket_id,))
                c.execute("DELETE FROM features WHERE id = ?", (cls.feature_id,))
                c.execute("DELETE FROM notes WHERE ticket_id = ?", (cls.ticket_id,))
        except Exception:
            pass

    def test_01_db_create_feature(self):
        feat = db.create_feature(self.feature_id, "Test Feature", "A feature for testing", "QA Bot")
        self.assertIsNotNone(feat)
        self.assertEqual(feat["id"], self.feature_id)

    def test_02_db_create_ticket(self):
        # Create without Manager role should fail
        with self.assertRaises(db.AuthorizationError):
            db.create_ticket(
                self.ticket_id, self.feature_id, "Test Ticket", "TASK", "P1",
                "Summary", "Context", ["AC1"], "Developer"
            )
            
        # Create with Manager role
        tkt = db.create_ticket(
            self.ticket_id, self.feature_id, "Test Ticket", "TASK", "P1",
            "Summary", "Context", ["AC1"], "Manager"
        )
        self.assertIsNotNone(tkt)
        self.assertEqual(tkt["id"], self.ticket_id)
        self.assertEqual(tkt["status"], "BACKLOG")

    def test_03_db_invalid_transition(self):
        # Developer cannot move BACKLOG -> IN_PROGRESS directly
        with self.assertRaises(db.InvalidTransitionError):
            db.update_ticket_status(self.ticket_id, "IN_PROGRESS", "Developer")
            
        # Manager CAN move BACKLOG -> IN_PROGRESS directly
        tkt = db.update_ticket_status(self.ticket_id, "IN_PROGRESS", "Manager")
        self.assertEqual(tkt["status"], "IN_PROGRESS")

    def test_04_db_add_check_task(self):
        # Add task
        db.add_ticket_task(self.ticket_id, "Write a test", "Developer")
        tkt = db.get_ticket(self.ticket_id)
        self.assertEqual(len(tkt["tasks"]), 1)
        self.assertFalse(tkt["tasks"][0]["completed"])
        
        # Check task
        db.check_ticket_task(self.ticket_id, 0, "Developer")
        tkt = db.get_ticket(self.ticket_id)
        self.assertTrue(tkt["tasks"][0]["completed"])

    def test_05_api_get_tickets(self):
        res = self.client.get("/api/tickets")
        self.assertEqual(res.status_code, 200)
        tickets = res.json()
        self.assertTrue(any(t["id"] == self.ticket_id for t in tickets))
        
    def test_06_api_update_status_forbidden(self):
        # Move IN_PROGRESS -> DONE (Developer cannot do this, only Reviewer/Manager)
        res = self.client.put(
            f"/api/tickets/{self.ticket_id}/status", 
            json={"status": "DONE", "role": "Developer"}
        )
        self.assertEqual(res.status_code, 422) # Should trigger InvalidTransitionError -> 422 VALIDATION_ERROR
        data = res.json()
        self.assertIn("error", data)
        self.assertEqual(data["error"]["code"], "VALIDATION_ERROR")

    def test_07_api_update_status_success(self):
        # Move IN_PROGRESS -> BLOCKED (Developer CAN do this)
        res = self.client.put(
            f"/api/tickets/{self.ticket_id}/status", 
            json={"status": "BLOCKED", "role": "Developer", "note": "Need help"}
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "BLOCKED")

    def test_08_api_add_note(self):
        res = self.client.post(
            f"/api/tickets/{self.ticket_id}/notes",
            json={"content": "This is a test note from API", "role": "Manager"}
        )
        self.assertEqual(res.status_code, 200)
        tkt = res.json()
        
        # Check that the note was added (it should be the last note)
        notes = tkt["notes"]
        self.assertTrue(any(n["content"] == "This is a test note from API" for n in notes))

    @classmethod
    def tearDownClass(cls):
        # Clean up
        try:
            with db.get_db() as conn:
                c = conn.cursor()
                c.execute("DELETE FROM tickets WHERE id = ?", (cls.ticket_id,))
                c.execute("DELETE FROM features WHERE id = ?", (cls.feature_id,))
                c.execute("DELETE FROM notes WHERE ticket_id = ?", (cls.ticket_id,))
        except Exception:
            pass

if __name__ == '__main__':
    unittest.main(verbosity=2)
