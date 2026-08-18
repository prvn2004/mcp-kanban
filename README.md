# Ticket Manager (MCP Server & Kanban UI)

Ticket Manager is a robust, local-first project management and Kanban system designed to be controlled by AI Agents via the Model Context Protocol (MCP), while providing a responsive React-based Kanban UI for human engineers.

## Quick Start

### 1. Prerequisites
- Python 3.10+
- Node.js 18+

### 2. Setup the Project
Clone the repository and set up the environments:

```bash
# Setup Python Backend (MCP + FastAPI)
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# Setup React UI
cd ui
npm install
npm run build
cd ..
```

### 3. Run the Server
The Python backend serves both the API and the React UI bundle.

```bash
# Run the FastAPI server
.\venv\Scripts\python -m uvicorn src.api:app --host 127.0.0.1 --port 8000
```
Navigate to `http://127.0.0.1:8000` in your browser to view the Kanban board.

## Commands

### Backend Commands
| Command | Description |
|---|---|
| `python -m uvicorn src.api:app --host 127.0.0.1 --port 8000` | Run the unified FastAPI server (serves REST API and built UI) |
| `python -m uvicorn src.api:app --reload` | Run FastAPI backend with auto-reload for development |
| `python src/server.py` | Run standalone FastMCP server over stdio for agent integrations |
| `python -m unittest discover -s tests -p "test_*.py"` | Run backend end-to-end and unit test suite |

### Frontend UI Commands (in `ui/`)
| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server with HMR at `http://localhost:5173` |
| `npm run build` | Typecheck (`tsc -b`) and compile production bundle to `ui/dist` |
| `npm run lint` | Lint frontend codebase with Oxlint |
| `npm run preview` | Locally preview production build |

## Architecture

### 4-Tier Hierarchy
Work is organized into four hierarchical levels:
1. **Project (`projects`)**: Top-level container representing an entire product or repository. Stores metadata and rich Markdown documentation (`documentation`).
2. **Feature / Epic (`features`)**: Large groupings of work under a project (e.g. `AUTH`, `PAYMENT`).
3. **Subfeature (`subfeatures`)**: Logical functional blocks inside a feature.
4. **Ticket (`tickets`)**: Actionable units of work (`TASK`, `BUG`, `CHORE`, `RESEARCH`, `REVIEW`, `HOTFIX`) containing priority, context, acceptance criteria, checklist tasks, and activity notes.

Cascading deletions ensure that deleting a feature or subfeature cleanly cleans up child records.

### Tech Stack
- **Database**: `SQLite3` (`db/tickets.db`) with automatic schema initialization (`db/schema.sql`) and connection context management.
- **Agent Protocol**: `FastMCP` (`src/server.py`) exposing project, feature, subfeature, and ticket management tools to AI agents.
- **REST API**: `FastAPI` (`src/api.py`, `src/api_routes/`) with strict CORS, rate-limiting middleware, custom exception mappers, and SPA static file fallback.
- **Frontend UI**: `React 19 + TypeScript + Vite + TailwindCSS` - A responsive, beautiful Kanban board for manual human intervention and review.

### Available MCP Tools

When mounted in an AI Agent, this server exposes 17 tools to the LLM context:

#### Project Tools
| Tool Name | Description |
|---|---|
| `create_project` | Create a top-level project container with title, summary, and initial documentation (Requires Manager role) |
| `get_project` | Retrieve project details, status, owner, and documentation markdown by ID |
| `list_projects` | List all projects available in the system |
| `update_project_docs` | Update the Markdown documentation content of a project (Requires Manager role) |

#### Feature & Subfeature Tools
| Tool Name | Description |
|---|---|
| `create_feature` | Create a parent feature/epic within a project (Requires Manager role) |
| `get_feature` | Retrieve details of a specific feature by ID |
| `list_features` | List features/epics, optionally filtered by `project_id` |
| `delete_feature` | Delete a feature and cascade delete all child subfeatures/tickets (Requires Manager role) |
| `create_subfeature` | Create a logical grouping inside a feature (Requires Manager role) |
| `get_subfeature` | Retrieve details of a subfeature by ID |
| `delete_subfeature` | Delete a subfeature and cascade delete child tickets (Requires Manager role) |

#### Ticket Tools
| Tool Name | Description |
|---|---|
| `create_ticket` | Create a new ticket (Requires Manager role) |
| `get_ticket` | Retrieve full context, checklist tasks, and historical notes for a ticket ID |
| `list_tickets` | Search and filter tickets by status, assignee, priority, type, parent feature/subfeature, or free text |
| `update_ticket_status` | Move a ticket across Kanban board states with role validation |
| `add_ticket_task` | Add a sub-task checklist item to a ticket |
| `check_ticket_task` | Mark a sub-task as completed (All tasks must be checked before Developer can transition to `IN_REVIEW`) |
| `add_ticket_note` | Append a timestamped note/comment to the ticket's activity log |
| `assign_ticket` | Assign a ticket to an engineer |
| `delete_ticket` | Delete a ticket and its associated notes (Requires Manager role) |

### Role-Based State Machine

- **Statuses**: `BACKLOG` -> `READY` -> `IN_PROGRESS` -> `IN_REVIEW` -> `DONE` (also `BLOCKED`, `CANCELLED`).
- **Roles**:
  - `Developer`: Can transition `READY` -> `IN_PROGRESS` -> `IN_REVIEW` or `BLOCKED`. Cannot move to `IN_REVIEW` if checklist tasks remain unchecked.
  - `Reviewer`: Can transition `IN_REVIEW` -> `DONE` or reject back to `IN_PROGRESS`.
  - `Manager`: Full administrative authority to transition between any status, create/delete entities, and update documentation.
  - **Reason Notes**: Moving to `BLOCKED` or rejecting from `IN_REVIEW` requires a `resolution_note`.

### REST API Overview

The backend exposes REST endpoints under `/api`:
- `GET /api/health` - Service health check
- `GET /api/projects`, `POST /api/projects`, `GET /api/projects/{id}`, `PUT /api/projects/{id}`, `PUT /api/projects/{id}/docs`
- `GET /api/features`, `GET /api/features/{id}`, `PUT /api/features/{id}`, `DELETE /api/features/{id}`
- `GET /api/subfeatures`, `GET /api/subfeatures/{id}`, `PUT /api/subfeatures/{id}`, `DELETE /api/subfeatures/{id}`
- `GET /api/tickets`, `PUT /api/tickets/{id}`, `PUT /api/tickets/{id}/status`, `PUT /api/tickets/{id}/tasks/check`, `POST /api/tickets/{id}/notes`, `DELETE /api/tickets/{id}`

### AI Agent Instructions (mcp.json)

To use this server with an AI Agent (like Claude Desktop or Codex), mount it in your `mcp.json` configuration file:

```json
{
  "mcpServers": {
    "ticket-manager": {
      "command": "python",
      "args": ["src/server.py"],
      "cwd": "/absolute/path/to/mcp-kanban",
      "env": {}
    }
  }
}
```

Once mounted, the agent has full access to project, feature, subfeature, and ticket management tools.

## Contributing

When modifying the backend, ensure that all database interactions run through the context manager in `src/db/connection.py` to prevent connection leaks and ensure foreign keys and schema updates are applied consistently.
