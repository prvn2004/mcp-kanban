import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Subfeature } from '../types';
import { Layers, ArrowLeft, Edit3, Save } from 'lucide-react';
import { KanbanBoard } from '../components/KanbanBoard';

export function SubfeatureView() {
  const { id } = useParams<{ id: string }>();
  const [subfeature, setSubfeature] = useState<Subfeature | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSubfeature, setEditedSubfeature] = useState<Subfeature | null>(null);

  const fetchSubfeature = async () => {
    try {
      const res = await fetch(`/api/subfeatures/${id}`);
      const data = await res.json();
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
    if (!editedSubfeature) return;
    try {
      const res = await fetch(`/api/subfeatures/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editedSubfeature.title,
          summary: editedSubfeature.summary,
          role: 'Manager'
        })
      });
      if (res.ok) {
        setIsEditing(false);
        fetchSubfeature();
      } else {
        alert((await res.json()).detail || 'Failed to update subfeature');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading Subfeature...</div>;
  if (!subfeature) return <div className="p-8 text-center text-red-500">Subfeature not found</div>;

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-[1400px] mx-auto w-full">
          <Link to={`/features/${subfeature.parent_feature_id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-3">
            <ArrowLeft size={14} /> Back to Feature {subfeature.parent_feature_id}
          </Link>
          
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-sm">
                <Layers size={18} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">{subfeature.id}</span>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editedSubfeature?.title || ''}
                    onChange={e => setEditedSubfeature(prev => prev ? {...prev, title: e.target.value} : null)}
                    className="w-full text-lg font-semibold text-slate-900 border-b-2 border-indigo-500 focus:outline-none bg-transparent"
                  />
                ) : (
                  <h1 className="text-lg font-semibold text-slate-900 tracking-tight">{subfeature.title}</h1>
                )}
              </div>
            </div>

            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                <Edit3 size={14} /> Edit
              </button>
            ) : (
              <button onClick={saveEdits} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                <Save size={14} /> Save
              </button>
            )}
          </div>
          
          {isEditing ? (
            <textarea 
              value={editedSubfeature?.summary || ''}
              onChange={e => setEditedSubfeature(prev => prev ? {...prev, summary: e.target.value} : null)}
              className="mt-4 w-full max-w-4xl text-slate-700 text-sm p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[80px]"
            />
          ) : (
            <p className="mt-3 text-slate-600 text-sm whitespace-pre-wrap leading-relaxed max-w-4xl">{subfeature.summary}</p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard parentId={subfeature.id} />
      </div>
    </div>
  );
}
