import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Feature } from '../types';
import { Trash2 } from 'lucide-react';
import { getFeatures, deleteFeature } from '../api';

export function Features() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (confirm(`Are you sure you want to delete feature ${id}?`)) {
      try {
        await deleteFeature(id);
        setFeatures(features.filter(f => f.id !== id));
      } catch (err: any) {
        alert(err.message || 'Failed to delete feature');
      }
    }
  };

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const data = await getFeatures();
        if (Array.isArray(data)) {
          const sorted = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setFeatures(sorted);
        } else {
          setFeatures([]);
        }
      } catch (e) {
        console.error(e);
        setFeatures([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatures();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading Features...</div>;

  return (
    <div className="max-w-5xl mx-auto w-full h-full p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
        <h1 className="text-xl font-semibold text-slate-900">All Features</h1>
        <div className="text-sm text-slate-500">{features.length} features</div>
      </div>

      <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
        <div className="grid grid-cols-12 gap-4 p-3 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
          <div className="col-span-2">Key</div>
          <div className="col-span-4">Title</div>
          <div className="col-span-5">Summary</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        <div className="flex flex-col">
          {features.map((feature, idx) => (
            <Link 
              key={feature.id} 
              to={`/features/${feature.id}`}
              className={`grid grid-cols-12 gap-4 p-3 items-center group hover:bg-slate-50 transition-colors ${idx !== features.length - 1 ? 'border-b border-slate-200' : ''}`}
            >
              <div className="col-span-2 text-xs font-mono text-slate-500 group-hover:text-blue-600">{feature.id}</div>
              <div className="col-span-4 text-sm font-medium text-slate-900 group-hover:text-blue-600 truncate pr-2">{feature.title}</div>
              <div className="col-span-5 text-sm text-slate-600 truncate pr-2">{feature.summary}</div>
              <div className="col-span-1 flex justify-end">
                <button 
                  onClick={(e) => handleDelete(e, feature.id)}
                  className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Link>
          ))}
          {features.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">
              No features found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
