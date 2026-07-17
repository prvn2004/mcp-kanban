class Queries:
    # Features
    CREATE_FEATURE = "INSERT INTO features (id, title, summary, owner) VALUES (?, ?, ?, ?)"
    GET_FEATURE = "SELECT * FROM features WHERE id = ? COLLATE NOCASE"
    LIST_FEATURES = "SELECT * FROM features"
    UPDATE_FEATURE = "UPDATE features SET title = ?, summary = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? COLLATE NOCASE"
    
    # Subfeatures
    CREATE_SUBFEATURE = "INSERT INTO subfeatures (id, parent_feature_id, title, summary) VALUES (?, ?, ?, ?)"
    GET_SUBFEATURE = "SELECT * FROM subfeatures WHERE id = ? COLLATE NOCASE"
    LIST_SUBFEATURES = "SELECT * FROM subfeatures"
    LIST_SUBFEATURES_BY_PARENT = "SELECT * FROM subfeatures WHERE parent_feature_id = ? COLLATE NOCASE"
    UPDATE_SUBFEATURE = "UPDATE subfeatures SET title = ?, summary = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? COLLATE NOCASE"
    
    # Tickets
    CREATE_TICKET = """INSERT INTO tickets 
        (id, parent_id, title, type, priority, summary, context, acceptance_criteria, tasks) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"""
    GET_TICKET = "SELECT * FROM tickets WHERE id = ? COLLATE NOCASE"
    LIST_TICKETS_BASE = "SELECT * FROM tickets WHERE 1=1"
    UPDATE_TICKET = """UPDATE tickets 
        SET title = ?, type = ?, priority = ?, summary = ?, context = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? COLLATE NOCASE"""
    UPDATE_TICKET_STATUS = "UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? COLLATE NOCASE"
    UPDATE_TICKET_TASKS = "UPDATE tickets SET tasks = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? COLLATE NOCASE"
    UPDATE_TICKET_ASSIGNEE = "UPDATE tickets SET assigned_to = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? COLLATE NOCASE"
    
    # Notes
    GET_TICKET_NOTES = "SELECT created_at, role, content FROM notes WHERE ticket_id = ? COLLATE NOCASE ORDER BY id ASC"
    ADD_NOTE = "INSERT INTO notes (ticket_id, role, content) VALUES (?, ?, ?)"

def build_list_tickets_query(status: str = None, assigned_to: str = None, priority: str = None, type: str = None, parent_id: str = None, search: str = None):
    query = Queries.LIST_TICKETS_BASE
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
        
    return query, params
