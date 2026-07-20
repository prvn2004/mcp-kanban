import { useState } from 'react';
import { X, Send, Save, Edit3, Trash2 } from 'lucide-react';
import type { Ticket } from '../types';

import { TICKET_STATUSES, TICKET_PRIORITIES, TICKET_TYPES } from '../constants';
import { updateTicketStatus, checkTicketTask, addTicketNote, updateTicket, deleteTicket } from '../api';

export function TicketModal({ ticket, onClose, onUpdate }: { ticket: Ticket, onClose: () => void, onUpdate: () => void }) {
  const [newNote, setNewNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTicket, setEditedTicket] = useState(ticket);

  const moveTicket = async (newStatus: string) => {
    try {
      await updateTicketStatus(ticket.id, newStatus);
      onUpdate();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ticket ${ticket.id}?`)) {
      try {
        await deleteTicket(ticket.id);
        onClose();
        onUpdate();
      } catch (e: any) {
        console.error(e);
        alert(e.message || 'Failed to delete ticket');
      }
    }
  };

  const checkTask = async (index: number) => {
    try {
      await checkTicketTask(ticket.id, index);
      onUpdate();
    } catch (e) {
      console.error(e);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    try {
      await addTicketNote(ticket.id, newNote);
      setNewNote('');
      onUpdate();
    } catch (e) {
      console.error(e);
    }
  };

  const saveEdits = async () => {
    try {
      await updateTicket(ticket.id, {
        title: editedTicket.title,
        type: editedTicket.type,
        priority: editedTicket.priority,
        summary: editedTicket.summary,
        context: editedTicket.context,
      });
      setIsEditing(false);
      onUpdate();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200">
      <div className="bg-white shadow-2xl w-full max-w-[550px] h-full flex flex-col border-l border-slate-200 slide-in-from-right-full duration-300">
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded bg-white">{ticket.id}</span>
            <span className="text-xs font-semibold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">{ticket.status}</span>
          </div>
          <div className="flex items-center gap-1">
            {!isEditing ? (
              <>
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-blue-600 border border-transparent hover:border-blue-200 hover:bg-blue-50 px-2 py-1 rounded transition-colors">
                  <Edit3 size={14} /> Edit
                </button>
                <button onClick={handleDelete} className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-red-600 border border-transparent hover:border-red-200 hover:bg-red-50 px-2 py-1 rounded transition-colors" title="Delete Ticket">
                  <Trash2 size={14} /> Delete
                </button>
              </>
            ) : (
              <button onClick={saveEdits} className="flex items-center gap-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-2 py-1 rounded transition-colors shadow-sm">
                <Save size={14} /> Save
              </button>
            )}
            <div className="w-px h-4 bg-slate-300 mx-1"></div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 hover:bg-slate-200 rounded transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Title Area */}
          <div>
            {isEditing ? (
              <input 
                type="text" 
                value={editedTicket.title}
                onChange={e => setEditedTicket({...editedTicket, title: e.target.value})}
                className="w-full text-lg font-semibold text-slate-900 border border-slate-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
              />
            ) : (
              <h2 className="text-lg font-semibold text-slate-900 leading-tight">{ticket.title}</h2>
            )}
          </div>
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-md">
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">Status</span>
              <select 
                className="w-full bg-white border border-slate-300 rounded text-xs p-1 text-slate-800 focus:outline-none focus:border-blue-500"
                value={ticket.status}
                onChange={(e) => moveTicket(e.target.value)}
              >
                {TICKET_STATUSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">Assignee</span>
              <div className="text-xs text-slate-800 bg-white border border-slate-300 rounded p-1 truncate h-[26px] flex items-center">{ticket.assigned_to || 'Unassigned'}</div>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">Priority</span>
              {isEditing ? (
                <select 
                  className="w-full bg-white border border-slate-300 rounded text-xs p-1 text-slate-800 focus:outline-none focus:border-blue-500"
                  value={editedTicket.priority}
                  onChange={(e) => setEditedTicket({...editedTicket, priority: e.target.value})}
                >
                  {TICKET_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              ) : (
                <div className="text-xs text-slate-800 bg-white border border-slate-300 rounded p-1 h-[26px] flex items-center">{ticket.priority}</div>
              )}
            </div>
            {isEditing && (
              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">Type</span>
                <select 
                  className="w-full bg-white border border-slate-300 rounded text-xs p-1 text-slate-800 focus:outline-none focus:border-blue-500"
                  value={editedTicket.type}
                  onChange={(e) => setEditedTicket({...editedTicket, type: e.target.value})}
                >
                  {TICKET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            )}
          </div>
          
          {/* Main Details */}
          <div className="space-y-5">
            <div>
              <h4 className="text-xs font-semibold text-slate-800 mb-1.5 flex items-center gap-1">Summary</h4>
              {isEditing ? (
                <textarea 
                  value={editedTicket.summary}
                  onChange={e => setEditedTicket({...editedTicket, summary: e.target.value})}
                  className="w-full text-slate-800 text-xs p-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[80px]"
                />
              ) : (
                <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{ticket.summary}</p>
              )}
            </div>
            
            {(ticket.context || isEditing) && (
              <div>
                <h4 className="text-xs font-semibold text-slate-800 mb-1.5 flex items-center gap-1">Context</h4>
                {isEditing ? (
                  <textarea 
                    value={editedTicket.context || ''}
                    onChange={e => setEditedTicket({...editedTicket, context: e.target.value})}
                    className="w-full text-slate-800 text-xs p-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[80px]"
                  />
                ) : (
                  <div className="bg-slate-50 text-slate-700 text-sm whitespace-pre-wrap p-3 rounded border border-slate-200 leading-relaxed">
                    {ticket.context}
                  </div>
                )}
              </div>
            )}

            {ticket.acceptance_criteria && ticket.acceptance_criteria.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-800 mb-1.5">Acceptance Criteria</h4>
                <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                  {ticket.acceptance_criteria.map((ac, i) => (
                    <li key={i}>{ac}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {ticket.tasks && ticket.tasks.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-800 mb-2 flex items-center justify-between">
                  Tasks
                  <span className="text-[10px] font-normal text-slate-500">
                    {ticket.tasks.filter((t: any) => t.completed).length} of {ticket.tasks.length} done
                  </span>
                </h4>
                <div className="space-y-1.5">
                  {ticket.tasks.map((task, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm bg-white p-2 rounded border border-slate-200">
                      <input 
                        type="checkbox" 
                        checked={task.completed} 
                        onChange={() => checkTask(i)}
                        className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className={`leading-snug ${task.completed ? "line-through text-slate-400" : "text-slate-700"}`}>
                        {task.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Notes */}
          <div className="pt-5 border-t border-slate-200">
            <h4 className="text-xs font-semibold text-slate-800 mb-3">Activity & Notes</h4>
            <div className="space-y-3 mb-4">
              {ticket.notes && ticket.notes.map((note, i) => (
                <div key={i} className="bg-white p-3 rounded text-xs border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-800">{note.role}</span>
                    <span className="text-[10px] text-slate-400">{new Date(note.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                </div>
              ))}
              {(!ticket.notes || ticket.notes.length === 0) && (
                <div className="text-xs text-slate-400 italic">No activity yet.</div>
              )}
            </div>
            
            <div className="flex gap-2">
              <textarea 
                placeholder="Type a note..." 
                className="flex-1 border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[40px] resize-none"
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
                className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 p-2 rounded transition-colors disabled:opacity-50 flex items-center justify-center shrink-0 shadow-sm"
              >
                <Send size={14} className={newNote.trim() ? "text-blue-600" : "text-slate-400"} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
