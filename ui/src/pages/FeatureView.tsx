import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import type { Feature, Subfeature } from '../types';
import { Target, Layers, Edit3, Save, ArrowLeft, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import { KanbanBoard } from '../components/KanbanBoard';
import { getFeatures, getSubfeatures, updateFeature, deleteSubfeature, deleteFeature } from '../api';

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
      const [featData, subData] = await Promise.all([
        getFeatures(),
        getSubfeatures()
      ]);
      
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
      await updateFeature(id, editedFeature.title, editedFeature.summary);
      setIsEditingFeature(false);
      fetchData();
    } catch (e) {
      console.error(e);
      alert((e as Error).message || 'Failed to update feature');
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

  const handleMainBoardClick = (featureId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (featureId !== id) {
      navigate(`/features/${featureId}`);
    } else {
      setSearchParams({});
    }
  };

  const handleDeleteSubfeature = async (subId: string) => {
    if (confirm(`Are you sure you want to delete subfeature ${subId}?`)) {
      try {
        await deleteSubfeature(subId);
        setSearchParams({}); // Navigate away from the deleted subfeature
        fetchData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete subfeature');
      }
    }
  };

  const handleDeleteFeature = async (e: React.MouseEvent, featureId: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete feature ${featureId}?`)) {
      try {
        await deleteFeature(featureId);
        if (id === featureId) navigate('/');
        else fetchData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete feature');
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading Workspace...</div>;

  const currentFeature = allFeatures.find(f => f.id === id);
  if (!currentFeature) return <div className="p-8 text-center text-red-500">Feature not found</div>;

  const activeSubfeature = allSubfeatures.find(s => s.id === activeSubfeatureId);

  return (
    <div className="flex h-full bg-white overflow-hidden w-full">
      {/* LEFT SIDEBAR - TREE NAVIGATION */}
      <div className="w-[260px] shrink-0 bg-slate-50/30 flex flex-col h-full border-r border-slate-200">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50">
          <Link to="/" className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-blue-600 transition-colors">
            <ArrowLeft size={12} /> Back to Projects
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Workspace Navigation</div>
          
          <div className="flex flex-col gap-0.5">
            {allFeatures.map(feat => {
              const isExpanded = expandedFeatures[feat.id];
              const isCurrentFeat = feat.id === id;
              const featSubs = allSubfeatures.filter(s => s.parent_feature_id === feat.id);
              
              return (
                <div key={feat.id} className="flex flex-col">
                  {/* Feature Node (Folder) */}
                  <div 
                    onClick={() => setExpandedFeatures(prev => ({ ...prev, [feat.id]: !prev[feat.id] }))}
                    className="flex items-center justify-between gap-1.5 p-1.5 rounded-md cursor-pointer transition-colors group hover:bg-slate-100"
                  >
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <button className="p-0.5 text-slate-400 hover:text-slate-600 rounded-sm shrink-0">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                      <Target size={12} className={isExpanded ? 'text-slate-600 shrink-0' : 'text-slate-400 shrink-0'} />
                      <span className={`text-[11px] font-medium truncate ${isExpanded ? 'text-slate-900' : 'text-slate-700'}`}>
                        {feat.id}: {feat.title}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteFeature(e, feat.id)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all shrink-0"
                      title="Delete Feature"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  
                  {/* Subfeature Nodes & Main Board Leaf */}
                  {isExpanded && (
                    <div className="flex flex-col gap-0.5 ml-6 border-l border-slate-200 pl-1.5 my-0.5">
                      {/* Main Board Leaf Node */}
                      <div 
                        onClick={(e) => handleMainBoardClick(feat.id, e)}
                        className={`flex items-center gap-1.5 p-1.5 rounded-md cursor-pointer transition-colors group ${
                          isCurrentFeat && !activeSubfeatureId ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Target size={11} className={isCurrentFeat && !activeSubfeatureId ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500'} />
                        <span className="text-[11px] truncate">
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
                            className={`flex items-center justify-between gap-1.5 p-1.5 rounded-md cursor-pointer transition-colors group ${
                              isCurrentSub ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-slate-100 text-slate-600'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              <Layers size={11} className={isCurrentSub ? 'text-blue-600 shrink-0' : 'text-slate-400 group-hover:text-slate-500 shrink-0'} />
                              <span className="text-[11px] truncate">
                                {sub.title}
                              </span>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSubfeature(sub.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all shrink-0"
                              title="Delete Subfeature"
                            >
                              <Trash2 size={11} />
                            </button>
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
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        {/* TOP PANEL - CURRENT FEATURE DETAILS */}
        <div className="bg-white border-b border-slate-200 p-5 shrink-0">
          <div className="max-w-6xl mx-auto flex justify-between items-start">
            <div className="flex-1 max-w-4xl">
              <div className="flex items-center gap-2 mb-1.5">
                <Target size={12} className="text-slate-500" />
                <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase border border-slate-200 px-1 py-0.5 rounded-sm">{currentFeature.id}</span>
              </div>
              
              {isEditingFeature ? (
                <div className="space-y-2 mt-1">
                  <input 
                    type="text" 
                    value={editedFeature?.title || ''}
                    onChange={e => setEditedFeature(prev => prev ? {...prev, title: e.target.value} : null)}
                    className="w-full text-lg font-semibold text-slate-900 border border-slate-300 rounded-sm px-2 py-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                  <textarea 
                    value={editedFeature?.summary || ''}
                    onChange={e => setEditedFeature(prev => prev ? {...prev, summary: e.target.value} : null)}
                    className="w-full text-slate-700 text-xs p-2 border border-slate-300 rounded-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 min-h-[60px]"
                  />
                  <div className="flex justify-start gap-2">
                    <button onClick={saveEdits} className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-3 py-1 rounded-md transition-colors shadow-sm">
                      <Save size={12} /> Save
                    </button>
                    <button onClick={() => setIsEditingFeature(false)} className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3 py-1 rounded-md">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="group relative pr-16">
                  <h1 className="text-lg font-semibold text-slate-900 leading-tight mb-1">{currentFeature.title}</h1>
                  <p className="text-slate-600 text-xs leading-relaxed max-w-3xl">{currentFeature.summary}</p>
                  
                  <button 
                    onClick={() => setIsEditingFeature(true)} 
                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600 transition-all bg-white border border-slate-200 px-2 py-0.5 rounded-sm shadow-sm"
                  >
                    <Edit3 size={11} /> Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM PANEL - BOARD */}
        <div className="flex-1 flex flex-col overflow-hidden relative bg-[#fafafa]">
          {activeSubfeatureId && activeSubfeature ? (
            <>
              <div className="bg-white border-b border-slate-200 px-5 py-2 flex items-center justify-between z-10 shrink-0 absolute top-0 left-0 right-0">
                <div className="flex items-center gap-2">
                  <Layers size={12} className="text-slate-500" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase border border-slate-200 bg-slate-50 px-1 py-0.5 rounded-sm">{activeSubfeature.id}</span>
                  <span className="text-xs font-semibold text-slate-700">{activeSubfeature.title}</span>
                </div>
                <button 
                  onClick={() => handleDeleteSubfeature(activeSubfeature.id)}
                  className="flex items-center gap-1 text-[10px] font-medium text-slate-500 hover:text-red-600 border border-transparent hover:border-red-200 hover:bg-red-50 px-1.5 py-0.5 rounded-sm transition-colors"
                  title="Delete Subfeature"
                >
                  <Trash2 size={11} /> Delete
                </button>
              </div>
              <div className="flex-1 pt-9 overflow-hidden">
                <KanbanBoard parentId={activeSubfeatureId} />
              </div>
            </>
          ) : (
            <>
              <div className="bg-white border-b border-slate-200 px-5 py-2 flex items-center justify-between z-10 shrink-0 absolute top-0 left-0 right-0">
                <div className="flex items-center gap-2">
                  <Target size={12} className="text-slate-500" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase border border-slate-200 bg-slate-50 px-1 py-0.5 rounded-sm">{currentFeature.id}</span>
                  <span className="text-xs font-semibold text-slate-700">Main Feature Board</span>
                </div>
              </div>
              <div className="flex-1 pt-9 overflow-hidden">
                <KanbanBoard parentId={currentFeature.id} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
