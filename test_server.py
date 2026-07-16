import sys
import os
from pathlib import Path

# Add src to Python path
sys.path.append(str(Path(__file__).parent / 'src'))

import db

def run_tests():
    print("Testing DB...")
    
    # Clean up DB if it exists for a fresh test run
    db_path = db.DB_PATH
    if db_path.exists():
        os.remove(db_path)
        
    print("1. Creating Feature...")
    f = db.create_feature("RAP", "Rapiber Core", "Core application features", "Rapiber Team")
    print(f)
    
    print("\n2. Creating Subfeature...")
    sf = db.create_subfeature("RAP-AUTH", "RAP", "Authentication", "User login and registration")
    print(sf)
    
    print("\n3. Creating Ticket...")
    t = db.create_ticket(
        "RAP-AUTH-001", "RAP-AUTH", 
        "Implement Login Endpoint", "TASK", "P0", 
        "Create the POST /login endpoint", 
        "Needs JWT.", 
        ["Returns 200 on success", "Returns 401 on invalid creds"], 
        "Manager"
    )
    print(t)
    
    print("\n4. Developer Assigning Ticket...")
    # Ticket is currently BACKLOG. Developer assigning should fail if not READY
    try:
        db.assign_ticket("RAP-AUTH-001", "dev_alice", "Developer")
        print("FAIL: Developer should not be able to assign BACKLOG ticket")
    except Exception as e:
        print("PASS (Expected Error):", str(e))
        
    print("\n5. Manager moves to READY...")
    db.update_ticket_status("RAP-AUTH-001", "READY", "Manager")
    t = db.get_ticket("RAP-AUTH-001")
    print("Status:", t['status'])
    
    print("\n6. Developer Assigns and Moves to IN_PROGRESS...")
    db.assign_ticket("RAP-AUTH-001", "dev_alice", "Developer")
    db.update_ticket_status("RAP-AUTH-001", "IN_PROGRESS", "Developer")
    t = db.get_ticket("RAP-AUTH-001")
    print("Assignee:", t['assigned_to'])
    print("Status:", t['status'])
    
    print("\n7. Add Tasks...")
    db.add_ticket_task("RAP-AUTH-001", "Write Controller", "Manager")
    db.add_ticket_task("RAP-AUTH-001", "Write Tests", "Developer")
    t = db.get_ticket("RAP-AUTH-001")
    print("Tasks:", t['tasks'])
    
    print("\n8. Developer tries to move to IN_REVIEW without finishing tasks...")
    try:
        db.update_ticket_status("RAP-AUTH-001", "IN_REVIEW", "Developer")
        print("FAIL: Should not transition with unfinished tasks")
    except Exception as e:
        print("PASS (Expected Error):", str(e))
        
    print("\n9. Developer completes tasks...")
    db.check_ticket_task("RAP-AUTH-001", 0, "Developer")
    db.check_ticket_task("RAP-AUTH-001", 1, "Developer")
    
    print("\n10. Developer moves to IN_REVIEW...")
    db.update_ticket_status("RAP-AUTH-001", "IN_REVIEW", "Developer")
    t = db.get_ticket("RAP-AUTH-001")
    print("Status:", t['status'])
    
    print("\n11. Reviewer requests changes (IN_PROGRESS)...")
    db.update_ticket_status("RAP-AUTH-001", "IN_PROGRESS", "Reviewer", "Forgot edge case in test")
    t = db.get_ticket("RAP-AUTH-001")
    print("Status:", t['status'])
    
    print("\n12. Reviewer approves (DONE)...")
    db.update_ticket_status("RAP-AUTH-001", "IN_REVIEW", "Developer")
    db.update_ticket_status("RAP-AUTH-001", "DONE", "Reviewer", "Looks good now.")
    t = db.get_ticket("RAP-AUTH-001")
    print("Final Status:", t['status'])
    
    print("\nNotes History:")
    for n in t['notes']:
        print(f"[{n['created_at']}] [{n['role']}] {n['content']}")

if __name__ == "__main__":
    run_tests()
