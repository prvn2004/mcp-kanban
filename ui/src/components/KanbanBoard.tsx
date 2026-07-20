import { useState, useEffect } from 'react';
import { CheckSquare, MessageSquare } from 'lucide-react';
import type { Ticket } from '../types';
import { TicketModal } from './TicketModal';
import { TICKET_STATUSES } from '../constants';
import { getTickets } from '../api';

export function KanbanBoard({ parentId }: { parentId?: string }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const fetchTickets = async () => {
    try {
      const data = await getTickets(parentId);
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
  }, [parentId]);

  if (loading) return <div className="p-8 text-center text-slate-500 flex-1 flex items-center justify-center font-medium">Loading Kanban Board...</div>;

  return (
    <div className="flex-1 overflow-x-auto p-4 h-full flex relative">
      <div className="flex gap-3 items-start min-w-max flex-1 h-full">
        {TICKET_STATUSES.map(col => (
          <div key={col} className="bg-slate-50/50 rounded-md w-72 flex flex-col border border-slate-200 max-h-full shrink-0">
            <div className="p-2 bg-slate-100/50 rounded-t-md border-b border-slate-200 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-700 tracking-wide">
                  {col.replace('_', ' ')}
                </h3>
                <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                  {tickets.filter(t => t.status === col).length}
                </span>
              </div>
            </div>
            
            <div className="p-2 flex-1 overflow-y-auto space-y-2 custom-scrollbar">
              {tickets.filter(t => t.status === col).map(ticket => (
                <div 
                  key={ticket.id} 
                  onClick={() => setSelectedTicket(ticket)}
                  className="bg-white p-2.5 rounded-sm border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer group flex flex-col gap-1.5 shadow-sm"
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-mono text-slate-500 group-hover:text-blue-600 transition-colors">{ticket.id}</span>
                    <span className={`text-[9px] px-1 py-0.5 rounded-sm font-bold uppercase tracking-wider border
                      ${ticket.priority === 'P0' ? 'bg-red-50 text-red-600 border-red-200' : 
                        ticket.priority === 'P1' ? 'bg-orange-50 text-orange-600 border-orange-200' : 
                        'bg-slate-50 text-slate-600 border-slate-200'}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  
                  <h4 className="text-xs text-slate-900 font-medium leading-snug line-clamp-3">{ticket.title}</h4>
                  
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mt-1">
                    <div className="flex items-center gap-2">
                      {ticket.tasks && ticket.tasks.length > 0 && (
                        <span className={`flex items-center gap-1 ${ticket.tasks.filter((t:any)=>t.completed).length === ticket.tasks.length ? 'text-emerald-500' : 'text-slate-500'}`}>
                          <CheckSquare size={12} /> {ticket.tasks.filter((t: any) => t.completed).length}/{ticket.tasks.length}
                        </span>
                      )}
                      {ticket.notes && ticket.notes.length > 0 && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <MessageSquare size={12} /> {ticket.notes.length}
                        </span>
                      )}
                    </div>
                    {ticket.assigned_to && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1 py-0.5 rounded-sm truncate max-w-[80px]">
                        {ticket.assigned_to.split(' ')[0]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {tickets.filter(t => t.status === col).length === 0 && (
                <div className="h-10 flex items-center justify-center border border-dashed border-slate-200 rounded-sm">
                  <span className="text-[10px] font-medium text-slate-400">Empty</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedTicket && (
        <TicketModal 
          ticket={selectedTicket} 
          onClose={() => setSelectedTicket(null)} 
          onUpdate={fetchTickets} 
        />
      )}
    </div>
  );
}
