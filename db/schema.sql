CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    documentation TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    owner TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS features (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    owner TEXT,
    project_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS subfeatures (
    id TEXT PRIMARY KEY,
    parent_feature_id TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    status TEXT NOT NULL DEFAULT 'PLANNED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_feature_id) REFERENCES features(id)
);

CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    parent_id TEXT NOT NULL, -- can be feature or subfeature id
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- TASK | BUG | CHORE | RESEARCH | REVIEW | HOTFIX
    status TEXT NOT NULL DEFAULT 'BACKLOG', -- BACKLOG | READY | IN_PROGRESS | IN_REVIEW | BLOCKED | DONE | CANCELLED
    priority TEXT NOT NULL, -- P0 | P1 | P2 | P3
    summary TEXT,
    context TEXT,
    acceptance_criteria TEXT, -- Stored as JSON array or text
    tasks TEXT, -- Stored as JSON array
    assigned_to TEXT,
    resolved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id)
);
