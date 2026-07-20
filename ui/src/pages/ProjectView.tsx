import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Project, Feature } from '../types';
import { FolderGit2, BookOpen, Target, Trash2, Edit3 } from 'lucide-react';
import { getProject, getFeatures, deleteFeature, updateProjectDocs } from '../api';
import ReactMarkdown from 'react-markdown';

export function ProjectView() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditingDocs, setIsEditingDocs] = useState(false);
  const [docsContent, setDocsContent] = useState('');

  const fetchProjectData = async () => {
    if (!id) return;
    try {
      const projData = await getProject(id);
      setProject(projData);
      setDocsContent(projData.documentation || '');
      
      const featuresData = await getFeatures(id);
      if (Array.isArray(featuresData)) {
        setFeatures(featuresData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const handleDeleteFeature = async (e: React.MouseEvent, featureId: string) => {
    e.preventDefault();
    if (confirm(`Are you sure you want to delete feature ${featureId}?`)) {
      try {
        await deleteFeature(featureId);
        setFeatures(features.filter(f => f.id !== featureId));
      } catch (err: any) {
        alert(err.message || 'Failed to delete feature');
      }
    }
  };

  const handleSaveDocs = async () => {
    if (!id) return;
    try {
      await updateProjectDocs(id, docsContent);
      setProject(prev => prev ? { ...prev, documentation: docsContent } : null);
      setIsEditingDocs(false);
    } catch (e: any) {
      alert(e.message || 'Failed to update docs');
    }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center text-slate-400">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <FolderGit2 size={32} />
        <span className="font-medium">Loading Project...</span>
      </div>
    </div>
  );
  if (!project) return <div className="p-8 text-center text-red-500 font-bold">Project not found</div>;

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-1">
          <Link to="/" className="text-sm text-blue-600 hover:underline">Projects</Link>
          <span className="text-slate-400">/</span>
          <span className="text-sm font-semibold text-slate-800">{project.id}</span>
          <span className={`ml-2 text-[10px] font-medium px-2 py-0.5 rounded-full border ${project.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
            {project.status}
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">{project.title}</h1>
        {project.summary && <p className="text-sm text-slate-600 mt-1">{project.summary}</p>}
      </div>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col md:flex-row w-full">
        
        {/* Left Column: Features */}
        <div className="flex-1 md:border-r border-slate-200 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Target size={18} className="text-slate-400" /> Features
            </h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">{features.length}</span>
          </div>
          
          <div className="flex flex-col flex-1 bg-white">
            {features.map((feature) => (
              <Link 
                key={feature.id} 
                to={`/features/${feature.id}`}
                className="flex items-start justify-between gap-4 px-6 py-4 group hover:bg-slate-50 transition-colors border-b border-slate-200"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <Target size={16} className="text-blue-500 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 truncate">{feature.title}</span>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">{feature.id}</span>
                    </div>
                    <div className="text-xs text-slate-600 line-clamp-1">{feature.summary}</div>
                  </div>
                </div>
                <button 
                  onClick={(e) => handleDeleteFeature(e, feature.id)}
                  className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 shrink-0 hover:bg-red-50 rounded"
                  title="Delete Feature"
                >
                  <Trash2 size={14} />
                </button>
              </Link>
            ))}
            {features.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm">
                No features created yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Documentation */}
        <div className="w-full md:w-80 lg:w-96 p-6 bg-slate-50 shrink-0 border-t md:border-t-0 border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <BookOpen size={16} className="text-slate-400" /> Documentation
            </h2>
            {!isEditingDocs ? (
              <button 
                onClick={() => setIsEditingDocs(true)}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <Edit3 size={12} /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditingDocs(false)}
                  className="text-xs text-slate-500 hover:underline"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveDocs}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Save
                </button>
              </div>
            )}
          </div>
          
          <div className="text-sm text-slate-800">
            {isEditingDocs ? (
              <textarea
                value={docsContent}
                onChange={e => setDocsContent(e.target.value)}
                className="w-full h-[60vh] border border-slate-300 rounded p-3 font-mono text-xs resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                placeholder="Write project documentation in Markdown..."
              />
            ) : (
              <div className="prose prose-sm prose-slate max-w-none">
                {project.documentation ? (
                  <ReactMarkdown>{project.documentation}</ReactMarkdown>
                ) : (
                  <p className="text-slate-400 italic text-xs">No documentation. Click Edit to add some.</p>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
