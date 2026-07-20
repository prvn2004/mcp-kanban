import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { KanbanBoard } from './components/KanbanBoard';
import { Projects } from './pages/Projects';
import { ProjectView } from './pages/ProjectView';
import { Features } from './pages/Features';
import { FeatureView } from './pages/FeatureView';
import { SubfeatureView } from './pages/SubfeatureView';
import { Kanban, Briefcase } from 'lucide-react';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isGlobalBoard = location.pathname === '/board';
  const isProjects = location.pathname === '/' || location.pathname.startsWith('/projects');

  return (
    <div className="h-screen bg-[#f8fafc] flex flex-col font-sans relative overflow-hidden">
      <header className="bg-white px-4 py-2 flex items-center justify-between border-b border-slate-200 z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Kanban size={18} className="text-slate-700" />
            <h1 className="text-sm font-bold text-slate-800">Planner</h1>
          </div>
          
          <nav className="flex gap-1 text-sm font-medium">
            <Link 
              to="/" 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                isProjects 
                  ? 'bg-slate-100 text-slate-900' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Briefcase size={16} /> Projects
            </Link>
            <Link 
              to="/board" 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                isGlobalBoard 
                  ? 'bg-slate-100 text-slate-900' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Kanban size={16} /> Board
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectView />} />
          <Route path="/all-features" element={<Features />} />
          <Route path="/features/:id" element={<FeatureView />} />
          <Route path="/subfeatures/:id" element={<SubfeatureView />} />
          <Route path="/board" element={<KanbanBoard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
