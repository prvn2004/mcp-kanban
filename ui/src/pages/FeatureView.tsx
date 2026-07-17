import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import type { Feature, Subfeature } from '../types';
import { Target, Layers, Edit3, Save, ArrowLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { KanbanBoard } from '../components/KanbanBoard';

export function FeatureView() {
  const { id } = useParams<{ id: string }>(); // The current feature ID
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSubfeatureId = searchParams.get('sub');
  
  const [allFeatures, setAllFeatures] = useState<Feature[]>([]);
  const [allSubfeatures, setAllSubfeatures] = useState<Subfeature[]>([]);
  const [expandedFeatures, setExpandedFeatures] = useState<Record<string, boolean>>({});
  
  const [loading, setLoading] = useState(true);
  const [isEditingFeature, setIsEditingFeature] = useState(false);
  const [editedFeature, setEditedFeature] = useState<Feature | null>(null);

  const fetchData = async () => {
    try {
      const [featRes, subRes] = await Promise.all([
        fetch(`/api/features`),
        fetch(`/api/subfeatures`)
      ]);
      const featData = featRes.ok ? await featRes.json() : [];
      const subData = subRes.ok ? await subRes.json() : [];
      
      const featArray = Array.isArray(featData) ? featData : [];
      featArray.sort((a: Feature, b: Feature) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setAllFeatures(featArray);
      const subs = Array.isArray(subData) ? subData : [];
      subs.sort((a: Subfeature, b: Subfeature) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setAllSubfeatures(subs);
      
      // Initialize expanded state for the current feature
      if (id) {
        setExpandedFeatures(prev => ({ ...prev, [id]: true }));
      }
      
      // Set the edited feature to the current one
      const currentFeat = (featData || []).find((f: Feature) => f.id === id);
      setEditedFeature(currentFeat || null);
      
      // Default to first subfeature if none selected
      if (!activeSubfeatureId && id) {
        const featureSubs = subs.filter((s: Subfeature) => s.parent_feature_id === id);
        if (featureSubs.length > 0) {
          setSearchParams({ sub: featureSubs[0].id }, { replace: true });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // When the ID changes, make sure it is expanded
    if (id) {
      setExpandedFeatures(prev => ({ ...prev, [id]: true }));
    }
  }, [id]);

  // Update edited feature when switching features
  useEffect(() => {
    const currentFeat = allFeatures.find(f => f.id === id);
    setEditedFeature(currentFeat || null);
    setIsEditingFeature(false);
  }, [id, allFeatures]);

  const saveEdits = async () => {
    if (!editedFeature || !id) return;
    try {
      const res = await fetch(`/api/features/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editedFeature.title,
          summary: editedFeature.summary,
          role: 'Manager'
        })
      });
      if (res.ok) {
        setIsEditingFeature(false);
        fetchData();
      } else {
        alert((await res.json()).detail || 'Failed to update feature');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubfeatureClick = (featureId: string, subId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (featureId !== id) {
      navigate(`/features/${featureId}?sub=${subId}`);
    } else {
      setSearchParams({ sub: subId });
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading Workspace...</div>;

  const currentFeature = allFeatures.find(f => f.id === id);
  if (!currentFeature) return <div className="p-8 text-center text-red-500">Feature not found</div>;

  const activeSubfeature = allSubfeatures.find(s => s.id === activeSubfeatureId);

  return (
    <div className="flex h-full bg-[#f8fafc] overflow-hidden w-full">
      {/* LEFT SIDEBAR - TREE NAVIGATION */}
      <div className="w-[280px] shrink-0 bg-white shadow-[1px_0_10px_rgba(0,0,0,0.03)] z-10 flex flex-col h-full border-r border-slate-200/50">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <Link to="/" className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-blue-600 transition-colors">
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Navigation</div>
          
          <div className="flex flex-col gap-1">
            {allFeatures.map(feat => {
              const isExpanded = expandedFeatures[feat.id];
              const isCurrentFeat = feat.id === id;
              const featSubs = allSubfeatures.filter(s => s.parent_feature_id === feat.id);
              
              return (
                <div key={feat.id} className="flex flex-col">
                  {/* Feature Node (Folder) */}
                  <div 
                    onClick={() => setExpandedFeatures(prev => ({ ...prev, [feat.id]: !prev[feat.id] }))}
                    className={`flex items-center gap-1.5 p-2 rounded-lg cursor-pointer transition-colors group hover:bg-slate-50`}
                  >
                    <button className="p-0.5 text-slate-400 hover:text-slate-600 rounded">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    <Target size={14} className={isExpanded ? 'text-blue-500' : 'text-slate-400'} />
                    <span className={`text-xs font-semibold truncate ${isExpanded ? 'text-slate-900' : 'text-slate-700'}`}>
                      {feat.id}: {feat.title}
                    </span>
                  </div>
                  
                  {/* Subfeature Nodes & Main Board Leaf */}
                  {isExpanded && (
                    <div className="flex flex-col gap-0.5 ml-6 mt-1 border-l border-slate-100 pl-2">
                      {/* Main Board Leaf Node */}
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/features/${feat.id}`);
                          setSearchParams({});
                        }}
                        className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors group ${
                          isCurrentFeat && !activeSubfeatureId ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                        }`}
                      >
                        <Target size={12} className={isCurrentFeat && !activeSubfeatureId ? 'text-blue-600' : 'text-slate-300 group-hover:text-slate-400'} />
                        <span className={`text-[11px] truncate font-medium ${isCurrentFeat && !activeSubfeatureId ? 'text-blue-800' : 'text-slate-600'}`}>
                          Main Board
                        </span>
                      </div>

                      {/* Subfeatures */}
                      {featSubs.map(sub => {
                        const isCurrentSub = activeSubfeatureId === sub.id;
                        return (
                          <div 
                            key={sub.id}
                            onClick={(e) => handleSubfeatureClick(feat.id, sub.id, e)}
                            className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors group ${
                              isCurrentSub ? 'bg-indigo-50/50' : 'hover:bg-slate-50'
                            }`}
                          >
                            <Layers size={12} className={isCurrentSub ? 'text-indigo-500' : 'text-slate-300 group-hover:text-slate-400'} />
                            <span className={`text-[11px] truncate font-medium ${isCurrentSub ? 'text-indigo-700' : 'text-slate-600'}`}>
                              {sub.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT MAIN AREA - FEATURE INFO & BOARD */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f8fafc]">
        {/* TOP PANEL - CURRENT FEATURE DETAILS */}
        <div className="bg-white border-b border-slate-200/50 p-6 shadow-sm z-10 shrink-0">
          <div className="max-w-6xl mx-auto flex justify-between items-start">
            <div className="flex-1 max-w-4xl">
              <div className="flex items-center gap-2 mb-1">
                <Target size={14} className="text-blue-500" />
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{currentFeature.id}</span>
              </div>
              
              {isEditingFeature ? (
                <div className="space-y-3 mt-2">
                  <input 
                    type="text" 
                    value={editedFeature?.title || ''}
                    onChange={e => setEditedFeature(prev => prev ? {...prev, title: e.target.value} : null)}
                    className="w-full text-xl font-bold text-slate-900 border-b border-blue-500 focus:outline-none bg-transparent"
                  />
                  <textarea 
                    value={editedFeature?.summary || ''}
                    onChange={e => setEditedFeature(prev => prev ? {...prev, summary: e.target.value} : null)}
                    className="w-full text-slate-700 text-sm p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[80px]"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setIsEditingFeature(false)} className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg">Cancel</button>
                    <button onClick={saveEdits} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg transition-colors shadow-sm">
                      <Save size={14} /> Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="group relative">
                  <h1 className="text-xl font-bold text-slate-900 leading-tight mb-2 pr-12">{currentFeature.title}</h1>
                  <p className="text-slate-600 text-sm leading-relaxed max-w-3xl">{currentFeature.summary}</p>
                  
                  <button 
                    onClick={() => setIsEditingFeature(true)} 
                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-all bg-slate-50 px-2 py-1 rounded"
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM PANEL - BOARD */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {activeSubfeatureId && activeSubfeature ? (
            <>
              <div className="bg-slate-50/80 backdrop-blur border-b border-slate-200/50 px-6 py-2.5 flex items-center justify-between z-10 shrink-0 absolute top-0 left-0 right-0">
                <div className="flex items-center gap-3">
                  <Layers size={14} className="text-indigo-500" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mr-2">{activeSubfeature.id}</span>
                    <span className="text-xs font-bold text-slate-700">{activeSubfeature.title}</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 pt-12 overflow-hidden">
                <KanbanBoard parentId={activeSubfeatureId} />
              </div>
            </>
          ) : (
            <>
              <div className="bg-slate-50/80 backdrop-blur border-b border-slate-200/50 px-6 py-2.5 flex items-center justify-between z-10 shrink-0 absolute top-0 left-0 right-0">
                <div className="flex items-center gap-3">
                  <Layers size={14} className="text-blue-500" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mr-2">{currentFeature.id}</span>
                    <span className="text-xs font-bold text-slate-700">Main Feature Board</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 pt-12 overflow-hidden">
                <KanbanBoard parentId={currentFeature.id} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
