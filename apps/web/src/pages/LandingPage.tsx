import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Users,
  Film,
  Camera,
  History,
  GitFork,
  MessageSquare,
  Shield,
  Download,
  ArrowRight,
  CheckCircle2,
  Clapperboard,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden font-sans">
      {/* Top Navigation */}
      <nav className="border-b border-border/80 bg-[#0d0f17]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              SF
            </div>
            <span className="font-bold text-base tracking-tight text-white">ScriptForge</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
            <a href="#features" className="hover:text-cyan-400 transition">Features</a>
            <a href="#workflow" className="hover:text-cyan-400 transition">Collaborative Workflow</a>
            <a href="#previs" className="hover:text-cyan-400 transition">3D Previs & Storyboard</a>
            <a href="#ai" className="hover:text-cyan-400 transition">AI Studio</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-cyan-900/30 transition"
            >
              Start Writing Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>The Next-Generation Cinematic Writing & Previs Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          Write Together. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            Create Without Limits.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          A collaborative story and screenplay workspace built for screenwriters, directors, editors, and creative teams with live multi-user editing, version control, Groq AI, and 3D camera previsualization.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-bold rounded-xl shadow-xl shadow-cyan-900/40 text-sm transition"
          >
            <span>Start Writing Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#12141c] hover:bg-zinc-800 border border-border text-slate-200 font-semibold rounded-xl text-sm transition"
          >
            Explore Live Demo
          </button>
        </div>

        {/* Hero Interactive Screenplay Canvas Preview Mockup */}
        <div className="relative pt-12 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-border/80 bg-[#12141c] shadow-2xl p-6 text-left relative overflow-hidden">
            {/* Window bar */}
            <div className="flex items-center justify-between pb-4 border-b border-border/60 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="font-mono text-slate-400 ml-2">The Last Signal — Act I (Live Collaboration)</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                3 Collaborators Online
              </div>
            </div>

            {/* Content Mockup */}
            <div className="pt-6 font-screenplay text-xs sm:text-sm text-slate-200 space-y-3 leading-relaxed">
              <div className="font-bold text-white">INT. ABANDONED STATION - NIGHT</div>
              <div className="text-slate-300">
                Cold starlight bleeds through a spiderweb-cracked observation viewport. Frost crawls across dead monitor banks.
              </div>
              <div className="text-center font-bold text-cyan-400 w-full pt-2">MAYA</div>
              <div className="text-center italic text-slate-400 text-xs">(whispering into comms)</div>
              <div className="mx-auto text-center max-w-md text-white">
                Daniel, you're not going to believe the telemetry. The waveform... it has biometric cadence.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Workflow Ribbon */}
      <section id="workflow" className="py-16 border-y border-border/60 bg-[#0c0e15]">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-6">
          <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold">
            The End-to-End Creative Pipeline
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-300">
            <span className="px-4 py-2 bg-[#181b26] rounded-lg border border-border">1. Idea & Concept</span>
            <ChevronRight className="w-4 h-4 text-slate-600 hidden sm:inline" />
            <span className="px-4 py-2 bg-[#181b26] rounded-lg border border-border">2. Screenplay Drafting</span>
            <ChevronRight className="w-4 h-4 text-slate-600 hidden sm:inline" />
            <span className="px-4 py-2 bg-[#181b26] rounded-lg border border-border">3. Live Review & Suggestions</span>
            <ChevronRight className="w-4 h-4 text-slate-600 hidden sm:inline" />
            <span className="px-4 py-2 bg-[#181b26] rounded-lg border border-border">4. 3D Previs & Camera Simulation</span>
            <ChevronRight className="w-4 h-4 text-slate-600 hidden sm:inline" />
            <span className="px-4 py-2 bg-[#181b26] rounded-lg border border-border">5. Storyboards & Production Export</span>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 max-w-6xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white tracking-tight">Built for Serious Storytellers</h2>
          <p className="text-slate-400 text-sm">
            Everything you need from initial brainstorming to multi-user script review, camera setups, and Final Draft FDX exports.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Users,
              title: 'Real-Time Collaboration',
              desc: 'Simultaneous editing with live colored cursors, presence avatars, and conflict-safe state syncing.',
            },
            {
              icon: Clapperboard,
              title: 'Screenplay Formatting',
              desc: 'Industry standard Courier 12pt layout with Tab cycling shortcuts for Scene Headings, Action, Dialogue, and Transitions.',
            },
            {
              icon: History,
              title: 'Version History & Visual Diffs',
              desc: 'Compare any two drafts side-by-side and safely restore older versions without ever losing history.',
            },
            {
              icon: GitFork,
              title: 'Story Branching Tree',
              desc: 'Explore alternate plot directions and endings without altering your master draft, then merge back seamlessly.',
            },
            {
              icon: Sparkles,
              title: 'Groq AI Writing Studio',
              desc: 'Turn one-line seeds into full structured 3-Act stories, doctor dialogue, and analyze pacing metrics.',
            },
            {
              icon: Camera,
              title: '3D Camera Previs & Blocking',
              desc: 'Simulate multi-camera setups, lens focal lengths, and top-down set blocking deterministically.',
            },
            {
              icon: Film,
              title: 'Visual Storyboard Cards',
              desc: 'Structured image prompts tied directly to your shot list for visual continuity between scenes.',
            },
            {
              icon: MessageSquare,
              title: 'Inline Comments & Suggestions',
              desc: 'Track Changes editorial workflow with threaded replies, text anchors, and Accept/Reject buttons.',
            },
            {
              icon: Download,
              title: 'Professional Multi-Export',
              desc: 'Real exports to Screenplay PDF, Final Draft FDX XML, DOCX, Fountain format, and production Shot List PDFs.',
            },
          ].map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#12141c] border border-border hover:border-slate-600 transition space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border/80 bg-[#0d0f17] text-center">
        <div className="max-w-3xl mx-auto px-6 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Your next story deserves a better workspace.</h2>
          <p className="text-slate-400 text-sm">
            Experience the complete studio for writing, collaborating, and pre-visualizing your films.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-bold rounded-xl shadow-xl shadow-cyan-900/40 text-sm transition"
          >
            Start Writing Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/40 text-center text-xs text-slate-500">
        ScriptForge Studio • Commercial SaaS Collaborative Writing & Previs System
      </footer>
    </div>
  );
};
