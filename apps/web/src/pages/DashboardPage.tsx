import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore.ts';
import { api } from '../lib/api.ts';
import { StoryStudioModal } from '../features/ai/StoryStudioModal.tsx';
import {
  Sparkles,
  Plus,
  Clapperboard,
  BookOpen,
  Film,
  Users,
  Clock,
  ArrowRight,
  Search,
  LogOut,
  FolderKanban,
  FileText,
  Trash2,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isStoryStudioOpen, setIsStoryStudioOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // New Project Form
  const [name, setName] = useState('');
  const [type, setType] = useState('SCREENPLAY');
  const [template, setTemplate] = useState('Screenplay Standard');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const res = await api.projects.list();
      setProjects(res.projects);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await api.projects.create({ name, type, template });
      setIsNewProjectModalOpen(false);
      setName('');
      navigate(`/workspace/${res.project.id}`);
    } catch (err: any) {
      alert('Failed to create project: ' + err.message);
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.genre && p.genre.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="h-16 border-b border-border bg-[#0d0f17] px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            SF
          </div>
          <span className="font-bold text-base tracking-tight text-white">ScriptForge Studio</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsStoryStudioOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Story Studio</span>
          </button>

          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-cyan-900/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>

          <div className="h-4 w-[1px] bg-border mx-1" />

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-8 space-y-10">
        {/* Welcome Greeting */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Good day, {user?.name || 'Writer'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {user?.roleTitle || 'Screenwriter'} • {projects.length} Active {projects.length === 1 ? 'Project' : 'Projects'} in Studio
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scripts, genres..."
              className="w-full pl-9 pr-3 py-2 bg-[#12141c] border border-border rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Quick Starter Templates */}
        <div className="space-y-3">
          <h2 className="text-xs uppercase tracking-wider font-bold text-slate-400">Quick Start from Template</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { name: 'Screenplay Standard', desc: 'Standard master scene draft with classic scene headings & action', type: 'SCREENPLAY' },
              { name: 'Three-Act Structure', desc: 'Pre-structured Act I (Setup), Act II (Confrontation), Act III (Resolution)', type: 'SCREENPLAY' },
              { name: 'Save the Cat', desc: 'Opening Image, Catalyst, Break into Two, Midpoint, and All Hope is Lost', type: 'SCREENPLAY' },
              { name: 'Character-Driven Story', desc: 'Focus on flaw arcs, psychological relationships, and subtextual dialogue', type: 'STORY' },
            ].map((tmpl) => (
              <div
                key={tmpl.name}
                onClick={async () => {
                  const res = await api.projects.create({
                    name: `Untitled (${tmpl.name})`,
                    type: tmpl.type,
                    template: tmpl.name,
                  });
                  navigate(`/workspace/${res.project.id}`);
                }}
                className="p-4 rounded-xl bg-[#12141c] border border-border hover:border-cyan-500/50 hover:bg-[#181b26] cursor-pointer transition flex flex-col justify-between space-y-2 group"
              >
                <div>
                  <div className="font-bold text-sm text-white group-hover:text-cyan-300 transition">{tmpl.name}</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-1">{tmpl.desc}</p>
                </div>
                <div className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
                  <span>Create Project</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Continue Writing: Project Cards */}
        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-wider font-bold text-slate-400">Continue Writing</h2>

          {isLoading ? (
            <div className="text-center py-16 text-slate-500 text-xs">Loading studio projects...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-16 border border-border/60 rounded-2xl bg-[#12141c] p-8 space-y-3">
              <Clapperboard className="w-10 h-10 mx-auto text-slate-600" />
              <h3 className="text-base font-bold text-white">Your next story starts here</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create a new project from scratch or use the AI Story Studio to generate a full world.
              </p>
              <button
                onClick={() => setIsNewProjectModalOpen(true)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition"
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/workspace/${p.id}`)}
                  className="p-5 rounded-2xl bg-[#12141c] border border-border hover:border-slate-500 transition cursor-pointer flex flex-col justify-between space-y-4 shadow-xl group"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-semibold text-[10px] uppercase tracking-wider">
                          {p.type}
                        </span>
                        {p.genre && (
                          <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 text-[10px]">
                            {p.genre}
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                      {p.name}
                    </h3>

                    {p.logline ? (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed italic">
                        "{p.logline}"
                      </p>
                    ) : p.description ? (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center -space-x-1">
                      {p.members?.map((m: any, idx: number) => (
                        <img
                          key={m.id || idx}
                          src={
                            m.user?.avatar ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.user?.name || 'U')}`
                          }
                          alt={m.user?.name}
                          className="w-5 h-5 rounded-full border border-border"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* New Project Modal */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#12141c] border border-border rounded-2xl shadow-2xl p-6 space-y-4 text-slate-100">
            <h3 className="text-base font-bold text-white">Create New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Project Title</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Protocol Zero"
                  className="w-full px-3 py-2 bg-[#090a0f] border border-border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Medium</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090a0f] border border-border rounded-lg text-slate-200"
                  >
                    <option value="SCREENPLAY">Screenplay</option>
                    <option value="SHORT_FILM">Short Film</option>
                    <option value="SERIES">Series / TV</option>
                    <option value="STORY">Story / Novel</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Template</label>
                  <select
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090a0f] border border-border rounded-lg text-slate-200"
                  >
                    <option>Screenplay Standard</option>
                    <option>Three-Act Structure</option>
                    <option>Save the Cat</option>
                    <option>Blank</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition shadow-md"
                >
                  Create & Launch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Story Studio Modal */}
      <StoryStudioModal
        isOpen={isStoryStudioOpen}
        onClose={() => setIsStoryStudioOpen(false)}
        onStoryCreated={(newProj) => navigate(`/workspace/${newProj.id}`)}
      />
    </div>
  );
};
