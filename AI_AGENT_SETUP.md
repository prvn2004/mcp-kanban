---
name: ticket-manager-setup
description: Instructions for AI Agents to automatically install, configure, and QA the Ticket Manager MCP Server.
---

# Ticket Manager Setup Instructions (For AI Agents)

Hello AI Agent! Follow these sequential steps to set up and configure `mcp-kanban` so that you (or other agents) can manage tickets via MCP tools, and human engineers can use the web Kanban UI.

Please strictly follow these sequential steps to ensure everything is configured properly. Do not skip any steps.

## Step 1: Install Dependencies
1. Open a terminal in the `mcp-kanban` directory.
2. Create a virtual environment and install the Python dependencies:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Change directory into `ui/`, install NPM dependencies, and build the React app:
   ```bash
   cd ui
   npm install
   npm run build
   cd ..
   ```

## Step 2: Configure the MCP Server (`mcp.json`)
Inject this tool into your IDE / Agent configuration:
1. Locate the configuration file (e.g. `~/.codex/config.json` or Claude Desktop `mcp.json`).
2. Add the `ticket-manager` entry to the `mcpServers` block using the **absolute path** for `cwd`:
   ```json
   {
     "mcpServers": {
       "ticket-manager": {
         "command": "python",
         "args": ["src/server.py"],
         "cwd": "C:/ABSOLUTE/PATH/TO/mcp-kanban",
         "env": {}
       }
     }
   }
   ```

## Step 3: Start the Backend Server
The UI and API run together on a unified FastAPI Uvicorn server:
1. Open a background task or long-running terminal and execute from the `mcp-kanban` root:
   ```bash
   .\venv\Scripts\python -m uvicorn src.api:app --host 127.0.0.1 --port 8000
   ```
2. Wait a few seconds for the server to start.
3. Test that the `/api/health` endpoint responds:
   ```bash
   .\venv\Scripts\python -c "import urllib.request; print(urllib.request.urlopen('http://127.0.0.1:8000/api/health').read().decode())"
   ```

## Step 4: Run the E2E Test Suite (QA)
Verify the system works end-to-end:
1. In a terminal, run the test suite:
   ```bash
   .\venv\Scripts\python -m unittest discover -s tests -p "test_*.py"
   ```
2. Confirm that all tests pass. If any fail, inspect the logs and resolve issues in `src/`.

## Step 5: AI Agent Workflow Best Practices
- **Projects**: Use `list_projects` to locate your target project or `create_project` to initialize a new one. Maintain project-level high-level context using `update_project_docs`.
- **Features & Subfeatures**: Group work logically using `create_feature` and `create_subfeature`.
- **Tickets**: Query active work with `list_tickets(status='ACTIVE')` or search by keyword.
- **Workflow State Transitions**:
  1. Pick up a ticket in `READY` status: assign to yourself using `assign_ticket(id, assignee, role='Developer')` and move to `IN_PROGRESS`.
  2. Implement code changes and log progress with `add_ticket_note`.
  3. Add and complete checklist tasks using `add_ticket_task` and `check_ticket_task`.
  4. Once all checklist tasks are checked, move to `IN_REVIEW`.
  5. Reviewers evaluate and transition `IN_REVIEW` -> `DONE` (or reject back to `IN_PROGRESS` with a resolution note).
- **Web UI**: Access the interactive Kanban board at `http://127.0.0.1:8000`.
