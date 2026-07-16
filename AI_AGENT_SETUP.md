---
name: ticket-manager-setup
description: Instructions for AI Agents to automatically install, configure, and QA the Ticket Manager MCP Server.
---

# Ticket Manager Setup Instructions (For AI Agents)

Hello AI Agent! The user wants you to completely set up and configure the `mcp-kanban` so that you (or other agents) can use it, and so the human user can view the Kanban UI.

Please strictly follow these sequential steps to ensure everything is configured properly. Do not skip any steps.

## Step 1: Install Dependencies
The user wants you to get the backend and frontend ready.
1. Open a terminal in the `mcp-kanban` directory.
2. Create a virtual environment and install the python dependencies:
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
   ```

## Step 2: Configure the MCP Server (`mcp.json`)
You need to inject this tool into the IDE/Agent's configuration so you can use it natively.
1. Locate the configuration file (usually in the AppData or `~/.gemini/config/` equivalent location for your specific agent architecture).
2. Add the `ticket-manager` to the `mcpServers` object in the JSON file. Ensure you use the **absolute path** to the repository for `cwd`.
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
The UI and API run on a FastAPI uvicorn server.
1. Open a *background task* or long-running terminal and execute the following from the `mcp-kanban` root:
   ```bash
   .\venv\Scripts\python -m uvicorn src.api:app --host 127.0.0.1 --port 8000
   ```
2. Wait a few seconds for the server to start.
3. Test that the `/api/health` endpoint is responding by running:
   ```bash
   .\venv\Scripts\python -c "import urllib.request; print(urllib.request.urlopen('http://127.0.0.1:8000/api/health').read().decode())"
   ```

## Step 4: Run the E2E Test Suite (QA)
Before concluding, you must prove the system works.
1. In a terminal, run the test suite:
   ```bash
   .\venv\Scripts\python -m unittest tests.test_system
   ```
2. Confirm that all tests pass. If they fail, inspect the logs and fix the `src/` codebase.

## Step 5: Wrap Up
Once everything is running, inform the user that:
1. The server is healthy.
2. The UI is accessible at `http://127.0.0.1:8000`.
3. The MCP server tools are successfully mounted and ready to use for ticketing!
