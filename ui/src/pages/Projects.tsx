import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Project } from '../types';
import { Briefcase, FolderGit2, BookOpen, Clock, Plus, X } from 'lucide-react';
import { getProjects, createProject } from '../api';

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProjectId, setNewProjectId] = useState('');
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectSummary, setNewProjectSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      if (Array.isArray(data)) {
        const sorted = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setProjects(sorted);
      } else {
        setProjects([]);
      }
    } catch (e) {
      console.error(e);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectId || !newProjectTitle) return;
    
    setIsSubmitting(true);
    try {
      const proj = await createProject(newProjectId, newProjectTitle, newProjectSummary);
      setShowAddModal(false);
      setNewProjectId('');
      setNewProjectTitle('');
      setNewProjectSummary('');
      navigate(`/projects/${proj.id}`);
    } catch (e) {
      console.error("Failed to create project", e);
      alert("Failed to create project: " + (e as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4 text-slate-400">
        <Briefcase size={32} />
        <span className="font-medium">Loading Projects...</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto w-full h-full p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-slate-900">Projects</h1>
          <span className="text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">{projects.length}</span>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md transition-colors shadow-sm"
        >
          <Plus size={14} /> New Project
        </button>
      </div>

      <div className="flex flex-col gap-0 border border-slate-200 rounded-md bg-white">
        {projects.map((project, idx) => (
          <Link 
            key={project.id} 
            to={`/projects/${project.id}`}
            className={`group p-4 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-slate-50 transition-colors ${idx !== projects.length - 1 ? 'border-b border-slate-200' : ''}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <FolderGit2 className="text-slate-400" size={16} />
                <h2 className="text-base font-semibold text-blue-600 group-hover:underline truncate">{project.title}</h2>
                <span className="text-xs text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{project.id}</span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${project.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                  {project.status}
                </span>
              </div>
              <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                {project.summary || 'No description provided.'}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-3">
                <div className="flex items-center gap-1">
                  <BookOpen size={14} /> Docs
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} /> Updated {new Date(project.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Link>
        ))}
        {projects.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-sm">
            No projects found. Create one using the button above.
          </div>
        )}
      </div>

      {showAddModal && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setShowAddModal(false)}
          />
          <div className="fixed inset-y-0 right-0 w-[400px] bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col transform transition-transform duration-300 translate-x-0">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 shrink-0">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Briefcase size={16} className="text-blue-600" /> Create New Project
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <form id="create-project-form" onSubmit={handleCreateProject} className="p-5 flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Project ID</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. PRJ-123"
                    value={newProjectId}
                    onChange={e => setNewProjectId(e.target.value.toUpperCase().replace(/\s+/g, '-'))}
                    className="w-full text-sm p-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Unique identifier used as prefix for features and tickets.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Project Title</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Website Redesign"
                    value={newProjectTitle}
                    onChange={e => setNewProjectTitle(e.target.value)}
                    className="w-full text-sm p-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Summary</label>
                  <textarea 
                    placeholder="Brief description of the project..."
                    value={newProjectSummary}
                    onChange={e => setNewProjectSummary(e.target.value)}
                    className="w-full text-sm p-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[120px] resize-none"
                  />
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0 flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="text-xs font-semibold text-slate-600 hover:bg-slate-200 px-4 py-2 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="create-project-form"
                disabled={isSubmitting || !newProjectId || !newProjectTitle}
                className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-md transition-colors shadow-sm"
              >
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
