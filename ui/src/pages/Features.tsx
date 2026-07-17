import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Feature } from '../types';
import { Target } from 'lucide-react';
import { getFeatures } from '../api';

export function Features() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="p-8 max-w-5xl mx-auto w-full h-full overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <Target className="text-slate-700" size={20} />
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Features</h1>
      </div>

      <div className="bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <div className="col-span-2">Key</div>
          <div className="col-span-3">Summary</div>
          <div className="col-span-7">Description</div>
        </div>
        <div className="flex flex-col">
          {features.map(feature => (
            <Link 
              key={feature.id} 
              to={`/features/${feature.id}`}
              className="grid grid-cols-12 gap-4 p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors items-center group"
            >
              <div className="col-span-2 text-xs font-bold text-slate-400 group-hover:text-blue-500 uppercase">{feature.id}</div>
              <div className="col-span-3 text-sm font-semibold text-slate-700 group-hover:text-blue-600 truncate pr-4">{feature.title}</div>
              <div className="col-span-7 text-sm text-slate-500 truncate pr-4">{feature.summary}</div>
            </Link>
          ))}
          {features.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">No features found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
