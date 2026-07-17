import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { KanbanBoard } from './components/KanbanBoard';
import { Features } from './pages/Features';
import { FeatureView } from './pages/FeatureView';
import { SubfeatureView } from './pages/SubfeatureView';
import { Kanban, Target } from 'lucide-react';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isGlobalBoard = location.pathname === '/board';
  const isFeatures = location.pathname === '/' || location.pathname.startsWith('/features');

  return (
    <div className="h-screen bg-[#f8fafc] flex flex-col font-sans relative overflow-hidden">
      <header className="bg-white px-6 py-4 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-xl text-white shadow-md">
              <Kanban size={24} />
            </div>
            <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight">Rapiber Planner</h1>
          </div>
          
          <nav className="flex gap-2">
            <Link 
              to="/" 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                isFeatures 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <Target size={18} /> Features
            </Link>
            <Link 
              to="/board" 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                isGlobalBoard 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <Kanban size={18} /> Global Board
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
          <Route path="/" element={<Features />} />
          <Route path="/features/:id" element={<FeatureView />} />
          <Route path="/subfeatures/:id" element={<SubfeatureView />} />
          <Route path="/board" element={<KanbanBoard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
