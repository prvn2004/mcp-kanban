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
    if not cursor.fetchone():
        if SCHEMA_PATH.exists():
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
