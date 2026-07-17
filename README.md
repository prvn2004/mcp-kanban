# Ticket Manager (MCP Server & Kanban UI)

Ticket Manager is a robust, local-first Kanban system designed specifically to be controlled by AI Agents via the Model Context Protocol (MCP), while also providing a beautiful React-based Kanban UI for human engineers.

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

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite development server for the UI with HMR |
| `npm run build` | Compile the React UI for production |
| `python -m uvicorn src.api:app --reload` | Run the FastAPI backend with auto-reload |

## Architecture

This project is built using a modern, lightweight, and highly portable stack:

- **Database**: `SQLite3` - Chosen for absolute portability. No external Docker containers or DB servers are required.
- **Agent Protocol**: `FastMCP` - Exposes the database to AI agents natively via their IDEs.
- **REST API**: `FastAPI` - A highly secure, rate-limited, and strict CORS-enforced API serving the human UI.
- **Frontend UI**: `React + Vite + TailwindCSS` - A responsive, beautiful Kanban board for manual human intervention and review.

### Available MCP Tools

When mounted in an AI Agent, this server exposes the following tools to the LLM context:

| Tool Name | Description |
|-----------|-------------|
| `create_feature` | Create a new parent feature/epic (Requires Manager role) |
| `get_feature` | Retrieve details of a specific feature by ID |
| `list_features` | List all available features |
| `create_subfeature` | Create a logical grouping inside a feature |
| `get_subfeature` | Retrieve details of a subfeature |
| `create_ticket` | Create a new ticket (Requires Manager role) |
| `get_ticket` | Retrieve full context, tasks, and historical notes for a specific ticket ID |
| `list_tickets` | Powerful search tool to filter tickets by status, assignee, priority, type, parent, or text |
| `update_ticket_status` | Move a ticket across the Kanban board (Enforces role-based state transitions) |
| `add_ticket_task` | Add a sub-task checklist item to a ticket |
| `check_ticket_task` | Mark a sub-task as completed (Required before moving to IN_REVIEW) |
| `add_ticket_note` | Append a note/comment to the ticket's activity log |
| `assign_ticket` | Assign a ticket to an engineer |

### AI Agent Instructions (mcp.json)

To use this server with an AI Agent (like Claude Desktop or Antigravity), you need to mount it in your `mcp.json` configuration file. 

Add the following entry to your `mcpServers` block. Be sure to replace the `cwd` path with the actual absolute path to the `ticket-mcp-server` directory on your machine:

```json
{
  "mcpServers": {
    "ticket-manager": {
      "command": "python",
      "args": [
        "src/server.py"
      ],
      "cwd": "/absolute/path/to/mcp-kanban",
      "env": {}
    }
  }
}
```

Once mounted, the agent will have access to tools like `list_tickets`, `get_ticket`, `add_ticket_note`, and `update_ticket_status`.

## Contributing

When modifying the backend, ensure that all database interactions run through the context manager in `src/db/connection.py` to prevent connection leaks.
