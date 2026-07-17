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
    <div className="flex-1 overflow-x-auto p-6 h-full flex flex-col">
      <div className="flex gap-4 items-start min-w-max flex-1">
        {TICKET_STATUSES.map(col => (
          <div key={col} className="bg-slate-50 rounded-xl w-72 flex flex-col border border-slate-200 max-h-full">
            <div className="p-3 bg-slate-100 rounded-t-xl border-b border-slate-200 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  {col.replace('_', ' ')}
                </h3>
                <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {tickets.filter(t => t.status === col).length}
                </span>
              </div>
            </div>
            
            <div className="p-2 flex-1 overflow-y-auto space-y-2 custom-scrollbar">
              {tickets.filter(t => t.status === col).map(ticket => (
                <div 
                  key={ticket.id} 
                  onClick={() => setSelectedTicket(ticket)}
                  className="bg-white p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-semibold text-slate-500 group-hover:text-blue-500 transition-colors uppercase">{ticket.id}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider
                        ${ticket.priority === 'P0' ? 'bg-red-50 text-red-600' : 
                          ticket.priority === 'P1' ? 'bg-orange-50 text-orange-600' : 
                          'bg-blue-50 text-blue-600'}`}>
                        {ticket.priority}
                      </span>
                    </div>
                  </div>
                  
                  <h4 className="text-[13px] text-slate-800 font-medium leading-snug mb-2 line-clamp-2">{ticket.title}</h4>
                  
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
                    <div className="flex items-center gap-2.5">
                      {ticket.tasks && ticket.tasks.length > 0 && (
                        <span className={`flex items-center gap-1 ${ticket.tasks.filter((t:any)=>t.completed).length === ticket.tasks.length ? 'text-green-500' : ''}`}>
                          <CheckSquare size={12} /> {ticket.tasks.filter((t: any) => t.completed).length}/{ticket.tasks.length}
                        </span>
                      )}
                      {ticket.notes && ticket.notes.length > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageSquare size={12} /> {ticket.notes.length}
                        </span>
                      )}
                    </div>
                    {ticket.assigned_to && (
                      <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded truncate max-w-[80px]">
                        {ticket.assigned_to.split(' ')[0]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {tickets.filter(t => t.status === col).length === 0 && (
                <div className="h-16 flex items-center justify-center border border-dashed border-slate-200 rounded-lg">
                  <span className="text-[11px] font-medium text-slate-400">Empty</span>
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
