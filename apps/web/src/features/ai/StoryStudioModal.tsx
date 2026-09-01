import React, { useState } from 'react';
import { api } from '../../lib/api.ts';
import { useProjectStore } from '../../stores/projectStore.ts';
import {
  Sparkles,
  Layers,
  Users,
  Film,
  ArrowRight,
  Check,
  RotateCw,
  X,
  BookOpen,
  Clapperboard,
  Tv,
} from 'lucide-react';

interface StoryStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: (project: any) => void;
}

export const StoryStudioModal: React.FC<StoryStudioModalProps> = ({ isOpen, onClose, onStoryCreated }) => {
  const [step, setStep] = useState<'idea' | 'concept' | 'structure' | 'characters' | 'screenplay'>('idea');
  const [ideaPrompt, setIdeaPrompt] = useState(
    'A psychological sci-fi thriller about a lone deep-space signal analyst who discovers a transmission predicting the crew’s deaths.'
  );
  const [generationMode, setGenerationMode] = useState('full');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<any>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!ideaPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const data = await api.ai.storyStudio({
        prompt: ideaPrompt,
        mode: generationMode,
      });
      setGeneratedStory(data);
      setStep('concept');
    } catch (err: any) {
      alert('Story generation failed: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateProjectFromStory = async () => {
    if (!generatedStory) return;
    try {
      const res = await api.projects.create({
        name: generatedStory.title || 'Untitled AI Project',
        description: generatedStory.logline || '',
        logline: generatedStory.logline || '',
        genre: generatedStory.genre || 'Sci-Fi Thriller',
        type: 'SCREENPLAY',
        visualStyle: 'Neo-Noir Cinematic',
        targetAudience: generatedStory.targetAudience || 'General Audience',
      });

      const newProject = res.project;

      // Update screenplay master draft with generated screenplay
      if (newProject.documents?.[0]?.id && generatedStory.screenplaySnippet) {
        await api.documents.updateContent(newProject.documents[0].id, generatedStory.screenplaySnippet, true);
      }

      // Add generated characters
      if (generatedStory.characters && generatedStory.characters.length > 0) {
        for (const c of generatedStory.characters) {
          await api.characters.create(newProject.id, c);
        }
      }

      onStoryCreated(newProject);
      onClose();
    } catch (err: any) {
      alert('Failed to initialize project: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#12141c] border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header with Workflow Stepper */}
        <div className="p-4 border-b border-border bg-[#0e1017] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI Story Studio</h2>
              <p className="text-xs text-slate-400">Idea → Story → Structure → Characters → Screenplay</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-zinc-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workflow Breadcrumb Indicator */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-[#090a0f] border-b border-border/60 text-xs overflow-x-auto">
          {[
            { id: 'idea', label: '1. Seed Idea' },
            { id: 'concept', label: '2. Concept' },
            { id: 'structure', label: '3. Acts & Structure' },
            { id: 'characters', label: '4. Characters' },
            { id: 'screenplay', label: '5. Screenplay' },
          ].map((item, idx) => (
            <button
              key={item.id}
              onClick={() => generatedStory && setStep(item.id as any)}
              disabled={!generatedStory && item.id !== 'idea'}
              className={`flex items-center gap-1.5 px-3 py-1 rounded transition whitespace-nowrap ${
                step === item.id
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: IDEA */}
          {step === 'idea' && (
            <div className="space-y-4 max-w-2xl mx-auto py-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200">Enter your story seed or logline:</label>
                <textarea
                  value={ideaPrompt}
                  onChange={(e) => setIdeaPrompt(e.target.value)}
                  rows={4}
                  placeholder="e.g. A cybernetic detective in neo-Tokyo who begins solving crimes committed in dreams..."
                  className="w-full p-4 bg-[#090a0f] border border-border rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { mode: 'full', label: 'Full Story Engine', desc: 'Concept, 3-Act Structure, Characters & Script' },
                  { mode: 'twist', label: 'High Concept & Twist', desc: 'Focus on unexpected narrative reversals' },
                  { mode: 'character', label: 'Character Driven', desc: 'Deep psychological profiles & flaw arcs' },
                ].map((m) => (
                  <button
                    key={m.mode}
                    onClick={() => setGenerationMode(m.mode)}
                    className={`p-3 rounded-lg border text-left transition ${
                      generationMode === m.mode
                        ? 'bg-cyan-500/10 border-cyan-500 text-white'
                        : 'bg-[#181b26] border-border/80 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="font-semibold text-cyan-400 mb-1">{m.label}</div>
                    <div className="text-[11px] text-slate-400">{m.desc}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-cyan-900/30 transition text-sm"
              >
                {isGenerating ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    Generating Full Cinematic World...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Story Project →
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 2: CONCEPT */}
          {step === 'concept' && generatedStory && (
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-[#090a0f] border border-border space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-cyan-400">{generatedStory.title}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-xs font-medium">
                        {generatedStory.genre}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs font-medium">
                        {generatedStory.tone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Logline</span>
                  <p className="text-sm text-slate-200 mt-1 leading-relaxed">"{generatedStory.logline}"</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/60 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold">Thematic Core:</span>
                    <p className="text-slate-300 mt-0.5">{generatedStory.themes}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold">Setting & World:</span>
                    <p className="text-slate-300 mt-0.5">{generatedStory.setting}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setStep('structure')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition"
                >
                  View 3-Act Structure →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: THREE-ACT STRUCTURE */}
          {step === 'structure' && generatedStory && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {generatedStory.acts?.map((act: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#090a0f] border border-border space-y-3 flex flex-col">
                    <h4 className="text-sm font-bold text-cyan-400">{act.act}</h4>
                    <div className="text-xs space-y-2 flex-1">
                      <div>
                        <span className="text-slate-400 font-semibold">Objective: </span>
                        <span className="text-slate-200">{act.mainObjective}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold">Turning Point: </span>
                        <span className="text-slate-200">{act.turningPoint}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold">Emotional Arc: </span>
                        <span className="text-slate-300 italic">{act.emotionalProgression}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setStep('concept')}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  ← Back to Concept
                </button>
                <button
                  onClick={() => setStep('characters')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition"
                >
                  View Characters →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CHARACTERS */}
          {step === 'characters' && generatedStory && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {generatedStory.characters?.map((c: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#090a0f] border border-border space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-cyan-400">{c.name}</h4>
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-[11px] text-slate-300 font-medium">{c.role}</span>
                    </div>
                    <p className="text-xs text-slate-300"><strong className="text-slate-400">Motivation:</strong> {c.motivation}</p>
                    <p className="text-xs text-slate-300"><strong className="text-slate-400">Arc:</strong> {c.arc}</p>
                    <div className="pt-2 border-t border-border/40 text-[11px] text-slate-400">
                      <strong>Visuals:</strong> {c.faceDescription} • {c.clothing}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setStep('structure')}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  ← Back to Structure
                </button>
                <button
                  onClick={() => setStep('screenplay')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition"
                >
                  View Generated Screenplay →
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: SCREENPLAY SNIPPET & INITIALIZATION */}
          {step === 'screenplay' && generatedStory && (
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-[#090a0f] border border-border space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Screenplay Master Draft</h4>
                <div className="p-4 rounded bg-[#0e1017] border border-border font-screenplay text-xs text-slate-200 whitespace-pre-wrap max-h-[350px] overflow-y-auto leading-relaxed">
                  {generatedStory.screenplaySnippet}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setStep('characters')}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  ← Back to Characters
                </button>

                <button
                  onClick={handleCreateProjectFromStory}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold rounded-lg shadow-xl shadow-cyan-900/30 text-xs transition"
                >
                  <Check className="w-4 h-4" />
                  Launch Project into Workspace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
