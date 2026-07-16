import { useEffect, useState } from 'react';
import { Kanban, CheckSquare, MessageSquare, X, Send } from 'lucide-react';

type Ticket = {
  id: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  summary: string;
  context: string;
  acceptance_criteria: string[];
  assigned_to: string | null;
  tasks: any[];
  notes: any[];
};

const COLUMNS = ['BACKLOG', 'READY', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED', 'CANCELLED'];

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newNote, setNewNote] = useState('');

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      setTickets(data);
      if (selectedTicket) {
        const updated = data.find((t: Ticket) => t.id === selectedTicket.id);
        setSelectedTicket(updated || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const moveTicket = async (ticketId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, role: 'Manager' })
      });
      if (res.ok) {
        fetchTickets();
      } else {
        const error = await res.json();
        alert(error.detail || 'Failed to move ticket');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const checkTask = async (ticketId: string, index: number) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/tasks/check`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_index: index, role: 'Developer' })
      });
      if (res.ok) {
        fetchTickets();
      } else {
        const error = await res.json();
        alert(error.detail || 'Failed to update task');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addNote = async () => {
    if (!selectedTicket || !newNote.trim()) return;
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote, role: 'Manager' })
      });
      if (res.ok) {
        setNewNote('');
        fetchTickets();
      } else {
        const error = await res.json();
        alert(error.detail || 'Failed to add note');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Jira Board...</div>;

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col font-sans relative">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded text-white">
            <Kanban size={20} />
          </div>
          <h1 className="text-xl font-semibold text-slate-800">Rapiber Ticket Manager</h1>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 items-start min-w-max h-full">
          {COLUMNS.map(col => (
            <div key={col} className="bg-gray-100 rounded-lg w-80 min-h-[500px] flex flex-col shadow-sm border border-gray-200">
              <div className="p-3 bg-gray-50 rounded-t-lg border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-600 tracking-wider">
                  {col.replace('_', ' ')} <span className="text-gray-400 ml-1 font-normal text-xs">{tickets.filter(t => t.status === col).length}</span>
                </h3>
              </div>
              
              <div className="p-2 flex-1 flex flex-col gap-2 overflow-y-auto">
                {tickets.filter(t => t.status === col).map(ticket => (
                  <div 
                    key={ticket.id} 
                    onClick={() => setSelectedTicket(ticket)}
                    className="bg-white p-3 rounded shadow-sm border border-gray-200 hover:shadow transition-shadow cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-gray-500">{ticket.id}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase
                        ${ticket.priority === 'P0' ? 'bg-red-100 text-red-700' : 
                          ticket.priority === 'P1' ? 'bg-orange-100 text-orange-700' : 
                          'bg-blue-100 text-blue-700'}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    
                    <h4 className="text-sm text-slate-800 font-medium mb-3 leading-tight">{ticket.title}</h4>
                    
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                      <div className="flex items-center gap-3 text-gray-400 text-xs">
                        {ticket.tasks && ticket.tasks.length > 0 && (
                          <span className="flex items-center gap-1">
                            <CheckSquare size={12} /> {ticket.tasks.filter((t: any) => t.completed).length}/{ticket.tasks.length}
                          </span>
                        )}
                        {ticket.notes && ticket.notes.length > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageSquare size={12} /> {ticket.notes.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* TICKET MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-8 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-full flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-500">{selectedTicket.id}</span>
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded font-bold">{selectedTicket.status}</span>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex gap-6">
              {/* Left Column */}
              <div className="flex-1 space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">{selectedTicket.title}</h2>
                
                {selectedTicket.summary && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Summary</h4>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{selectedTicket.summary}</p>
                  </div>
                )}
                
                {selectedTicket.context && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Context</h4>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap bg-yellow-50 p-3 rounded">{selectedTicket.context}</p>
                  </div>
                )}

                {selectedTicket.acceptance_criteria && selectedTicket.acceptance_criteria.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Acceptance Criteria</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {selectedTicket.acceptance_criteria.map((ac, i) => (
                        <li key={i}>{ac}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {selectedTicket.tasks && selectedTicket.tasks.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Tasks</h4>
                    <div className="space-y-2">
                      {selectedTicket.tasks.map((task, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm bg-gray-50 p-2 rounded border border-gray-100">
                          <input 
                            type="checkbox" 
                            checked={task.completed} 
                            onChange={() => checkTask(selectedTicket.id, i)}
                            className="mt-1 cursor-pointer"
                          />
                          <span className={task.completed ? "line-through text-gray-400" : "text-gray-700"}>{task.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="w-80 space-y-6 shrink-0">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 block mb-1">STATUS</span>
                    <select 
                      className="w-full border-gray-300 rounded text-sm p-1.5 focus:ring-blue-500"
                      value={selectedTicket.status}
                      onChange={(e) => moveTicket(selectedTicket.id, e.target.value)}
                    >
                      {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500 block mb-1">ASSIGNEE</span>
                    <div className="text-sm font-medium text-gray-800">{selectedTicket.assigned_to || 'Unassigned'}</div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500 block mb-1">PRIORITY</span>
                    <div className="text-sm font-medium text-gray-800">{selectedTicket.priority}</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-3">Activity & Notes</h4>
                  <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-2">
                    {selectedTicket.notes && selectedTicket.notes.map((note, i) => (
                      <div key={i} className="bg-blue-50/50 p-3 rounded text-sm border border-blue-100">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-blue-800 text-xs">{note.role}</span>
                          <span className="text-[10px] text-gray-400">{new Date(note.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-gray-700">{note.content}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add a note..." 
                      className="flex-1 border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-blue-500"
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addNote()}
                    />
                    <button 
                      onClick={addNote}
                      className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
