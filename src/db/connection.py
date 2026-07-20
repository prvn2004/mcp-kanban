import sqlite3
import os
from contextlib import contextmanager
from pathlib import Path

DB_PATH = Path(__file__).parent.parent.parent / 'db' / 'tickets.db'
SCHEMA_PATH = Path(__file__).parent.parent.parent / 'db' / 'schema.sql'

@contextmanager
def get_db():
    """Context manager for SQLite connections."""
    os.makedirs(DB_PATH.parent, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    
    # Initialize schema if new
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='tickets'")
    is_new_db = not cursor.fetchone()
    
    if SCHEMA_PATH.exists():
        with open(SCHEMA_PATH, 'r') as f:
            schema_sql = f.read()
        
        if is_new_db:
            cursor.executescript(schema_sql)
        else:
            # Run CREATE TABLE IF NOT EXISTS for any new tables (like projects)
            cursor.executescript(schema_sql)
            
            # Check if features table needs the project_id migration
            cursor.execute("PRAGMA table_info(features)")
            columns = [info['name'] for info in cursor.fetchall()]
            if 'project_id' not in columns:
                cursor.execute("ALTER TABLE features ADD COLUMN project_id TEXT NOT NULL DEFAULT 'DEFAULT'")
                # Also ensure a default project exists to satisfy the foreign key
                cursor.execute("INSERT OR IGNORE INTO projects (id, title, summary, owner) VALUES ('DEFAULT', 'Default Project', 'Auto-created default project', 'system')")
                
        conn.commit()
    
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
