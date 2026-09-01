import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore.ts';
import { api } from '../lib/api.ts';
import { Clapperboard, BookOpen, Film, Tv, Video, Sparkles, ArrowRight, Check } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateOnboarding } = useAuthStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [preferredType, setPreferredType] = useState('SCREENPLAY');
  const [roleTitle, setRoleTitle] = useState('Screenwriter');
  const [projectName, setProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const mediumOptions = [
    { id: 'SCREENPLAY', title: 'Feature Screenplay', icon: Clapperboard, desc: 'Standard 90-120 page industry format' },
    { id: 'SHORT_FILM', title: 'Short Film', icon: Film, desc: 'Compact 5-25 page cinematic narrative' },
    { id: 'SERIES', title: 'TV / Episodic Series', icon: Tv, desc: 'Pilots, bible, and season episode arcs' },
    { id: 'STORY', title: 'Story / Novel', icon: BookOpen, desc: 'Prose chapters, novels, and world-building' },
  ];

  const roleOptions = [
    { id: 'Screenwriter', title: 'Writer / Screenwriter', desc: 'Crafting dialogue, action beats, and plot structures' },
    { id: 'Director', title: 'Director', desc: 'Previsualization, camera blocking, and shot lists' },
    { id: 'Story Editor', title: 'Story Editor / Reviewer', desc: 'Providing feedback, notes, and track changes' },
    { id: 'Producer', title: 'Producer / Showrunner', desc: 'Managing story bibles, continuity, and breakdowns' },
  ];

  const handleFinishOnboarding = async () => {
    setIsCreating(true);
    try {
      await updateOnboarding({ roleTitle, preferredType });

      if (projectName.trim()) {
        const res = await api.projects.create({
          name: projectName,
          type: preferredType,
          template: 'Screenplay Standard',
        });
        navigate(`/workspace/${res.project.id}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      alert('Onboarding failed: ' + err.message);
      navigate('/dashboard');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] flex items-center justify-center p-6 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="w-full max-w-2xl bg-[#12141c] border border-border rounded-2xl shadow-2xl p-8 space-y-6">
        {/* Progress Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-cyan-600 flex items-center justify-center text-white font-bold text-xs">
              SF
            </div>
            <span className="font-semibold text-white">Welcome, {user?.name || 'Writer'}</span>
          </div>
          <span className="font-mono text-cyan-400">Step {step} of 3</span>
        </div>

        {/* STEP 1: WHAT ARE YOU CREATING? */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">What are you creating?</h2>
              <p className="text-xs text-slate-400">We'll tailor your editor canvas and templates</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {mediumOptions.map((m) => {
                const Icon = m.icon;
                const isSelected = preferredType === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setPreferredType(m.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500 ring-2 ring-cyan-500/20'
                        : 'bg-[#090a0f] border-border hover:border-slate-600'
                    }`}
                  >
                    <div className="space-y-2">
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <h4 className="font-bold text-sm text-white">{m.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-lg transition"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: WHAT IS YOUR ROLE? */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">What's your primary role?</h2>
              <p className="text-xs text-slate-400">Customize your default tools and collaboration permissions</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {roleOptions.map((r) => {
                const isSelected = roleTitle === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setRoleTitle(r.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500 ring-2 ring-cyan-500/20'
                        : 'bg-[#090a0f] border-border hover:border-slate-600'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-sm text-white">{r.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{r.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4">
              <button onClick={() => setStep(1)} className="text-xs text-slate-400 hover:text-white">
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-lg transition"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CREATE YOUR FIRST PROJECT OR SKIP */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">Create your first project</h2>
              <p className="text-xs text-slate-400">You can start from scratch or jump directly to your dashboard</p>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-slate-300">Project Title (Optional)</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Echoes of Europa"
                className="w-full px-3 py-2.5 bg-[#090a0f] border border-border rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => handleFinishOnboarding()}
                className="text-xs text-slate-400 hover:text-white"
              >
                Skip & Open Dashboard
              </button>
              <button
                onClick={handleFinishOnboarding}
                disabled={isCreating}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-cyan-900/30 transition"
              >
                <Check className="w-4 h-4" />
                <span>{isCreating ? 'Setting up...' : 'Launch Workspace'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
