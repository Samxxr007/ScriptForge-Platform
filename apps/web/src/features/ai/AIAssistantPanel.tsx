import React, { useState } from 'react';
import { useProjectStore } from '../../stores/projectStore.ts';
import { api } from '../../lib/api.ts';
import {
  Sparkles,
  Clapperboard,
  Camera,
  MessageSquare,
  Wand2,
  Lightbulb,
  HeartPulse,
  AlertCircle,
  Copy,
  Plus,
  Check,
  RotateCw,
  X,
  History,
} from 'lucide-react';

interface AIAssistantPanelProps {
  onInsertContent: (text: string) => void;
  onReplaceContent?: (text: string) => void;
  selectedText?: string;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ onInsertContent, onReplaceContent, selectedText = '' }) => {
  const { project, document, scenes, activeSceneId, setRightPanelTab } = useProjectStore();
  const [activeTab, setActiveTab] = useState<'generate' | 'direct' | 'cinema' | 'health' | 'continuity' | 'history'>('generate');

  const [promptInput, setPromptInput] = useState('');
  const [rewriteMode, setRewriteMode] = useState('Cinematic');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const activeScene = scenes.find((s) => s.id === activeSceneId) || scenes[0];

  // 1. Continue Scene
  const handleContinue = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const res = await api.ai.continueWriting({
        selectedText,
        sceneContext: activeScene?.content || document?.content || '',
        characterContext: project?.characters?.map((c: any) => c.name).join(', ') || '',
        projectId: project?.id,
      });
      setResult({ type: 'text', content: res.text, title: 'Scene Continuation' });
    } catch (err: any) {
      setResult({ type: 'error', content: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Improve Dialogue
  const handleImproveDialogue = async () => {
    if (!selectedText) {
      alert('Please select a dialogue line in the editor first.');
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const res = await api.ai.improveDialogue({
        dialogueText: selectedText,
        characterName: 'Character',
        characterTraits: 'Tense, observant',
        projectId: project?.id,
      });
      setResult({ type: 'text', content: res.text, title: 'Enhanced Dialogue' });
    } catch (err: any) {
      setResult({ type: 'error', content: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Rewrite
  const handleRewrite = async (mode: string) => {
    if (!selectedText) {
      alert('Please select text in the editor to rewrite.');
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const res = await api.ai.rewrite({
        text: selectedText,
        mode,
        projectId: project?.id,
      });
      setResult({ type: 'text', content: res.text, title: `Rewrite: ${mode}` });
    } catch (err: any) {
      setResult({ type: 'error', content: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Brainstorm
  const handleBrainstorm = async (category: string) => {
    setIsLoading(true);
    setResult(null);
    try {
      const res = await api.ai.brainstorm({
        topic: promptInput || activeScene?.title || project?.name || 'Screenplay Escalation',
        type: category,
        projectContext: project?.logline || '',
        projectId: project?.id,
      });
      setResult({ type: 'text', content: res.text, title: `Brainstorm: ${category}` });
    } catch (err: any) {
      setResult({ type: 'error', content: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Direct This Scene
  const handleDirectScene = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const res = await api.ai.directScene({
        sceneContent: activeScene?.content || document?.content || '',
        sceneTitle: activeScene?.title || 'Current Scene',
        projectId: project?.id,
      });
      setResult({ type: 'direct', data: res });
    } catch (err: any) {
      setResult({ type: 'error', content: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Cinematographer Advice
  const handleCinematographer = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const res = await api.ai.cinematographer({
        sceneContent: activeScene?.content || document?.content || '',
        instruction: promptInput || 'Make this confrontation more claustrophobic and intense',
        projectId: project?.id,
      });
      setResult({ type: 'cinema', data: res });
    } catch (err: any) {
      setResult({ type: 'error', content: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Screenplay Health Check
  const handleHealthCheck = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const res = await api.ai.healthCheck({
        content: document?.content || '',
        characters: project?.characters?.map((c: any) => `${c.name}: ${c.personality}`).join('; ') || '',
        projectId: project?.id,
      });
      setResult({ type: 'health', data: res });
    } catch (err: any) {
      setResult({ type: 'error', content: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // 8. Continuity Check
  const handleContinuityCheck = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const res = await api.ai.continuity({
        content: document?.content || '',
        characters: project?.characters?.map((c: any) => c.name).join(', ') || '',
        projectId: project?.id,
      });
      setResult({ type: 'continuity', data: res.issues });
    } catch (err: any) {
      setResult({ type: 'error', content: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#12141c] text-slate-100 border-l border-border select-text">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/80 bg-[#0e1017]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">ScriptForge AI</h3>
            <p className="text-[11px] text-slate-400">Powered by Groq Inference</p>
          </div>
        </div>
        <button
          onClick={() => setRightPanelTab(null)}
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-zinc-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex items-center gap-1 px-3 py-2 bg-[#0a0c12] border-b border-border/60 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('generate')}
          className={`px-2.5 py-1 rounded transition whitespace-nowrap ${
            activeTab === 'generate' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-white'
          }`}
        >
          Writing
        </button>
        <button
          onClick={() => {
            setActiveTab('direct');
            handleDirectScene();
          }}
          className={`px-2.5 py-1 rounded transition whitespace-nowrap ${
            activeTab === 'direct' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-white'
          }`}
        >
          Director
        </button>
        <button
          onClick={() => setActiveTab('cinema')}
          className={`px-2.5 py-1 rounded transition whitespace-nowrap ${
            activeTab === 'cinema' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-white'
          }`}
        >
          Cinematography
        </button>
        <button
          onClick={() => {
            setActiveTab('health');
            handleHealthCheck();
          }}
          className={`px-2.5 py-1 rounded transition whitespace-nowrap ${
            activeTab === 'health' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-white'
          }`}
        >
          Health
        </button>
        <button
          onClick={() => {
            setActiveTab('continuity');
            handleContinuityCheck();
          }}
          className={`px-2.5 py-1 rounded transition whitespace-nowrap ${
            activeTab === 'continuity' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-white'
          }`}
        >
          Continuity
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: WRITING ASSISTANT */}
        {activeTab === 'generate' && (
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleContinue}
                disabled={isLoading}
                className="flex flex-col items-start p-3 rounded-lg bg-[#181b26] hover:bg-[#202534] border border-border/80 transition text-left"
              >
                <div className="flex items-center gap-1.5 text-cyan-400 mb-1 text-xs font-semibold">
                  <Wand2 className="w-3.5 h-3.5" />
                  Continue Scene
                </div>
                <span className="text-[11px] text-slate-400 leading-tight">Write next action or beat naturally</span>
              </button>

              <button
                onClick={handleImproveDialogue}
                disabled={isLoading}
                className="flex flex-col items-start p-3 rounded-lg bg-[#181b26] hover:bg-[#202534] border border-border/80 transition text-left"
              >
                <div className="flex items-center gap-1.5 text-purple-400 mb-1 text-xs font-semibold">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Doctor Dialogue
                </div>
                <span className="text-[11px] text-slate-400 leading-tight">Sharpen selected spoken line</span>
              </button>
            </div>

            {/* Rewrite Modes */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Rewrite Selected Text</label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {['Dramatic', 'Concise', 'Emotional', 'Cinematic', 'Natural'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleRewrite(mode)}
                    disabled={isLoading}
                    className="px-2 py-1.5 bg-[#181b26] hover:bg-zinc-800 border border-border rounded text-[11px] text-slate-300 hover:text-cyan-300 transition"
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Brainstorming Section */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <label className="text-xs font-medium text-slate-300">Creative Brainstorming</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Topic or scene element..."
                  className="flex-1 px-3 py-1.5 bg-[#090a0f] border border-border rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleBrainstorm('Plot Twists')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-[#181b26] hover:bg-zinc-800 border border-border rounded text-xs text-amber-400 transition"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  Plot Twists
                </button>
                <button
                  onClick={() => handleBrainstorm('Conflict Escalations')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-[#181b26] hover:bg-zinc-800 border border-border rounded text-xs text-rose-400 transition"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  Conflicts
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI SCENE DIRECTOR */}
        {activeTab === 'direct' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">{activeScene?.title || 'Current Scene'}</span>
              <button
                onClick={handleDirectScene}
                disabled={isLoading}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:underline"
              >
                <RotateCw className="w-3 h-3" /> Re-Direct
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: AI CINEMATOGRAPHER */}
        {activeTab === 'cinema' && (
          <div className="space-y-3">
            <label className="text-xs font-medium text-slate-300">Cinematographer Instruction</label>
            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="e.g. How should we shoot this argument to make the audience feel the protagonist's impending panic?"
              rows={3}
              className="w-full p-2.5 bg-[#090a0f] border border-border rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleCinematographer}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-medium text-xs rounded border border-cyan-500/30 transition"
            >
              <Camera className="w-3.5 h-3.5" />
              Get DP Advice
            </button>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/20 flex items-center gap-3 animate-pulse">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-spin" />
            <div>
              <p className="text-xs font-medium text-cyan-300">ScriptForge AI is thinking...</p>
              <p className="text-[10px] text-slate-400">Processing narrative context & cinematic rules</p>
            </div>
          </div>
        )}

        {/* AI OUTPUT RENDERERS */}
        {result && !isLoading && (
          <div className="p-3.5 rounded-lg bg-[#181b26] border border-border space-y-3 animate-in fade-in duration-200">
            {/* Standard Text Result */}
            {result.type === 'text' && (
              <>
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <span className="text-xs font-semibold text-cyan-400">{result.title}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyToClipboard(result.content)}
                      className="p-1 text-slate-400 hover:text-white rounded"
                      title="Copy"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-screenplay bg-[#0e1017] p-3 rounded border border-border/40">
                  {result.content}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onInsertContent(result.content)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-medium transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Insert into Script
                  </button>
                  {onReplaceContent && selectedText && (
                    <button
                      onClick={() => onReplaceContent(result.content)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-slate-200 rounded text-xs transition"
                    >
                      Replace
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Direct Scene Result */}
            {result.type === 'direct' && (
              <div className="space-y-3 text-xs">
                <div className="border-b border-border pb-2">
                  <span className="text-[11px] uppercase tracking-wider text-cyan-400 font-semibold">Scene Intent</span>
                  <p className="text-slate-200 mt-1">{result.data.sceneIntent}</p>
                </div>
                <div className="border-b border-border pb-2">
                  <span className="text-[11px] uppercase tracking-wider text-purple-400 font-semibold">Visual Style & Lighting</span>
                  <p className="text-slate-300 mt-1">{result.data.visualStyle}</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Key: {result.data.lighting?.keyStyle}</p>
                </div>
                <div className="border-b border-border pb-2">
                  <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold">Sound & Score</span>
                  <p className="text-slate-300 mt-1">{result.data.sound?.ambient}</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Music: {result.data.sound?.music}</p>
                </div>
                <button
                  onClick={() => setRightPanelTab('shots')}
                  className="w-full py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-medium rounded transition"
                >
                  View in Shot List & Previs →
                </button>
              </div>
            )}

            {/* Cinematographer Advice */}
            {result.type === 'cinema' && (
              <div className="space-y-3 text-xs">
                <div className="p-2.5 rounded bg-[#090a0f] border border-border">
                  <span className="text-amber-400 font-semibold">Recommended Lens: </span>
                  <span className="text-white">{result.data.recommendedLens}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">Angle: </span>
                  <span className="text-slate-200">{result.data.cameraAngle}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">Lighting: </span>
                  <span className="text-slate-200">{result.data.lightingSetup}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">Movement: </span>
                  <span className="text-slate-200">{result.data.cameraMovement}</span>
                </div>
                <div className="pt-2 border-t border-border text-[11px] text-slate-400 italic">
                  "{result.data.cinematographerNote}"
                </div>
              </div>
            )}

            {/* Screenplay Health Analysis */}
            {result.type === 'health' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(result.data).map(([key, val]: any) => (
                    <div key={key} className="p-2 bg-[#0e1017] rounded border border-border">
                      <div className="flex justify-between items-center mb-1">
                        <span className="capitalize text-[11px] text-slate-400">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-bold text-cyan-400">{val.score || '85'}</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${val.score || 85}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-tight">{val.summary || (Array.isArray(val.issues) ? val.issues.join(', ') : '')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Continuity Issues */}
            {result.type === 'continuity' && (
              <div className="space-y-2 text-xs">
                {result.data.map((issue: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded bg-[#0e1017] border border-amber-500/30">
                    <div className="flex items-center gap-1.5 text-amber-400 font-medium text-[11px] mb-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {issue.type} ({issue.severity})
                    </div>
                    <p className="text-slate-300 text-[11px]">{issue.description}</p>
                    <p className="text-emerald-400 text-[10px] mt-1 font-medium">Fix: {issue.suggestedFix}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
