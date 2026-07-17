import { useState } from 'react';
import { X, Send, Save, Edit3 } from 'lucide-react';
import type { Ticket } from '../types';

const COLUMNS = ['BACKLOG', 'READY', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED', 'CANCELLED'];

export function TicketModal({ ticket, onClose, onUpdate }: { ticket: Ticket, onClose: () => void, onUpdate: () => void }) {
  const [newNote, setNewNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTicket, setEditedTicket] = useState(ticket);

  const moveTicket = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, role: 'Manager' })
      });
      if (res.ok) onUpdate();
      else alert((await res.json()).detail || 'Failed to move ticket');
    } catch (e) {
      console.error(e);
    }
  };

  const checkTask = async (index: number) => {
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/tasks/check`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_index: index, role: 'Developer' })
      });
      if (res.ok) onUpdate();
      else alert((await res.json()).detail || 'Failed to update task');
    } catch (e) {
      console.error(e);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote, role: 'Manager' })
      });
      if (res.ok) {
        setNewNote('');
        onUpdate();
      } else {
        alert((await res.json()).detail || 'Failed to add note');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveEdits = async () => {
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editedTicket.title,
          type: editedTicket.type,
          priority: editedTicket.priority,
          summary: editedTicket.summary,
          context: editedTicket.context,
          role: 'Manager'
        })
      });
      if (res.ok) {
        setIsEditing(false);
        onUpdate();
      } else {
        alert((await res.json()).detail || 'Failed to update ticket');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-8 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-gray-500 bg-gray-200 px-2.5 py-1 rounded-md">{ticket.id}</span>
            <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-md font-bold">{ticket.status}</span>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                <Edit3 size={16} /> Edit
              </button>
            ) : (
              <button onClick={saveEdits} className="flex items-center gap-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                <Save size={16} /> Save
              </button>
            )}
            <div className="w-px h-5 bg-gray-200 mx-1"></div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 flex gap-8 bg-white">
          {/* Left Column */}
          <div className="flex-1 space-y-8">
            <div>
              {isEditing ? (
                <input 
                  type="text" 
                  value={editedTicket.title}
                  onChange={e => setEditedTicket({...editedTicket, title: e.target.value})}
                  className="w-full text-2xl font-bold text-slate-900 border-b-2 border-blue-500 focus:outline-none pb-1 bg-transparent"
                />
              ) : (
                <h2 className="text-2xl font-bold text-slate-900 leading-tight">{ticket.title}</h2>
              )}
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2.5">Summary</h4>
                {isEditing ? (
                  <textarea 
                    value={editedTicket.summary}
                    onChange={e => setEditedTicket({...editedTicket, summary: e.target.value})}
                    className="w-full text-slate-700 text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[100px]"
                  />
                ) : (
                  <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{ticket.summary}</p>
                )}
              </div>
              
              {(ticket.context || isEditing) && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2.5">Context</h4>
                  {isEditing ? (
                    <textarea 
                      value={editedTicket.context || ''}
                      onChange={e => setEditedTicket({...editedTicket, context: e.target.value})}
                      className="w-full text-slate-700 text-sm p-3 border border-amber-200 bg-amber-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 min-h-[100px]"
                    />
                  ) : (
                    <div className="bg-amber-50 text-amber-900 text-sm whitespace-pre-wrap p-4 rounded-xl border border-amber-100/50 leading-relaxed">
                      {ticket.context}
                    </div>
                  )}
                </div>
              )}

              {ticket.acceptance_criteria && ticket.acceptance_criteria.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2.5">Acceptance Criteria</h4>
                  <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5">
                    {ticket.acceptance_criteria.map((ac, i) => (
                      <li key={i} className="pl-1 leading-relaxed">{ac}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {ticket.tasks && ticket.tasks.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2.5">Tasks</h4>
                  <div className="space-y-2.5">
                    {ticket.tasks.map((task, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="relative flex items-start mt-0.5">
                          <input 
                            type="checkbox" 
                            checked={task.completed} 
                            onChange={() => checkTask(i)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </div>
                        <span className={`leading-relaxed ${task.completed ? "line-through text-slate-400" : "text-slate-700"}`}>
                          {task.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="pt-8 border-t border-slate-100 mt-8">
              <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Activity & Notes</h4>
              <div className="space-y-4 mb-6">
                {ticket.notes && ticket.notes.map((note, i) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-xl text-sm border border-slate-100 relative group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-slate-900 text-xs">{note.role}</span>
                      <span className="text-[10px] font-medium text-slate-400">{new Date(note.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))}
                {(!ticket.notes || ticket.notes.length === 0) && (
                  <div className="text-sm text-slate-400 italic">No activity yet.</div>
                )}
              </div>
              
              <div className="flex gap-3">
                <textarea 
                  placeholder="Type a note..." 
                  className="flex-1 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors min-h-[60px]"
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      addNote();
                    }
                  }}
                />
                <button 
                  onClick={addNote}
                  disabled={!newNote.trim()}
                  className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center w-[60px]"
                >
                  <Send size={18} className={newNote.trim() ? "translate-x-0.5 -translate-y-0.5 transition-transform" : ""} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-80 space-y-6 shrink-0 flex flex-col h-full">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-5">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">STATUS</span>
                <select 
                  className="w-full bg-white border border-slate-200 rounded-lg text-sm p-2 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-shadow"
                  value={ticket.status}
                  onChange={(e) => moveTicket(e.target.value)}
                >
                  {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">ASSIGNEE</span>
                <div className="text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg p-2">{ticket.assigned_to || 'Unassigned'}</div>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">PRIORITY</span>
                {isEditing ? (
                  <select 
                    className="w-full bg-white border border-slate-200 rounded-lg text-sm p-2 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    value={editedTicket.priority}
                    onChange={(e) => setEditedTicket({...editedTicket, priority: e.target.value})}
                  >
                    <option value="P0">P0</option>
                    <option value="P1">P1</option>
                    <option value="P2">P2</option>
                  </select>
                ) : (
                  <div className="text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg p-2">{ticket.priority}</div>
                )}
              </div>
              {isEditing && (
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">TYPE</span>
                  <select 
                    className="w-full bg-white border border-slate-200 rounded-lg text-sm p-2 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    value={editedTicket.type}
                    onChange={(e) => setEditedTicket({...editedTicket, type: e.target.value})}
                  >
                    <option value="BUG">BUG</option>
                    <option value="FEATURE">FEATURE</option>
                    <option value="TASK">TASK</option>
                  </select>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
