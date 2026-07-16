import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def run_client():
    server_params = StdioServerParameters(
        command="venv/Scripts/python.exe",
        args=["src/server.py"]
    )
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            
            print("Connected to MCP Server!")
            
            # List tools
            tools = await session.list_tools()
            print("Tools available:")
            for tool in tools.tools:
                print(f" - {tool.name}")
                
            # Test a tool (list_features)
            print("\nCalling list_features...")
            result = await session.call_tool("list_features", arguments={})
            print(result)

if __name__ == "__main__":
    asyncio.run(run_client())
