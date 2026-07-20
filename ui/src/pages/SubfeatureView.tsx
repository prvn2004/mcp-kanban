import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Subfeature } from '../types';
import { Layers, ArrowLeft, Edit3, Save } from 'lucide-react';
import { KanbanBoard } from '../components/KanbanBoard';
import { getSubfeature, updateSubfeature } from '../api';

export function SubfeatureView() {
  const { id } = useParams<{ id: string }>();
  const [subfeature, setSubfeature] = useState<Subfeature | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSubfeature, setEditedSubfeature] = useState<Subfeature | null>(null);

  const fetchSubfeature = async () => {
    if (!id) return;
    try {
      const data = await getSubfeature(id);
      setSubfeature(data);
      setEditedSubfeature(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubfeature();
  }, [id]);

  const saveEdits = async () => {
    if (!editedSubfeature || !id) return;
    try {
      await updateSubfeature(id, editedSubfeature.title, editedSubfeature.summary);
      setIsEditing(false);
      fetchSubfeature();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading Subfeature...</div>;
  if (!subfeature) return <div className="p-8 text-center text-red-500">Subfeature not found</div>;

  return (
    <div className="flex flex-col h-full bg-[#fafafa]">
      <div className="bg-white border-b border-slate-200 px-5 py-4 shrink-0">
        <div className="max-w-6xl mx-auto w-full">
          <Link to={`/features/${subfeature.parent_feature_id}`} className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-blue-600 transition-colors mb-2">
            <ArrowLeft size={12} /> Back to Feature {subfeature.parent_feature_id}
          </Link>
          
          <div className="flex justify-between items-start">
            <div className="flex-1 max-w-4xl">
              <div className="flex items-center gap-2 mb-1.5">
                <Layers size={12} className="text-slate-500" />
                <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase border border-slate-200 px-1 py-0.5 rounded-sm">{subfeature.id}</span>
              </div>
              
              {isEditing ? (
                <div className="space-y-2 mt-1">
                  <input 
                    type="text" 
                    value={editedSubfeature?.title || ''}
                    onChange={e => setEditedSubfeature(prev => prev ? {...prev, title: e.target.value} : null)}
                    className="w-full text-lg font-semibold text-slate-900 border border-slate-300 rounded-sm px-2 py-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                  <textarea 
                    value={editedSubfeature?.summary || ''}
                    onChange={e => setEditedSubfeature(prev => prev ? {...prev, summary: e.target.value} : null)}
                    className="w-full text-slate-700 text-xs p-2 border border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 min-h-[60px]"
                  />
                  <div className="flex justify-start gap-2">
                    <button onClick={saveEdits} className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-3 py-1 rounded-md transition-colors shadow-sm">
                      <Save size={12} /> Save
                    </button>
                    <button onClick={() => setIsEditing(false)} className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3 py-1 rounded-md">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="group relative pr-16">
                  <h1 className="text-lg font-semibold text-slate-900 leading-tight mb-1">{subfeature.title}</h1>
                  <p className="text-slate-600 text-xs leading-relaxed max-w-3xl">{subfeature.summary}</p>
                  
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600 transition-all bg-white border border-slate-200 px-2 py-0.5 rounded-sm shadow-sm"
                  >
                    <Edit3 size={11} /> Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard parentId={subfeature.id} />
      </div>
    </div>
  );
}
