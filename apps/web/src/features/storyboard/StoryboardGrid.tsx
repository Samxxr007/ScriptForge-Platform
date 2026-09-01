import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../stores/projectStore.ts';
import { api } from '../../lib/api.ts';
import { Film, Sparkles, Download, RotateCw, Image as ImageIcon, Edit3, Check } from 'lucide-react';

export const StoryboardGrid: React.FC = () => {
  const { scenes, activeSceneId, setActiveSceneId } = useProjectStore();
  const [shots, setShots] = useState<any[]>([]);
  const [generatingShotId, setGeneratingShotId] = useState<string | null>(null);
  const [editingPromptShotId, setEditingPromptShotId] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  const activeScene = scenes.find((s) => s.id === activeSceneId) || scenes[0];

  useEffect(() => {
    if (activeScene?.id) {
      loadShots(activeScene.id);
    }
  }, [activeScene?.id]);

  const loadShots = async (sceneId: string) => {
    try {
      const res = await api.shots.list(sceneId);
      setShots(res.shots);
    } catch (err) {
      console.error('Failed to load storyboard shots:', err);
    }
  };

  const handleGenerateFrame = async (shot: any) => {
    setGeneratingShotId(shot.id);
    try {
      await api.shots.generateFrame(shot.id, {
        prompt: customPrompt || undefined,
        mood: 'suspenseful neo-noir cinematic',
        lighting: 'low-key chiaroscuro with starlight rim',
      });
      loadShots(activeScene.id);
      setEditingPromptShotId(null);
      setCustomPrompt('');
    } catch (err: any) {
      alert('Frame generation failed: ' + err.message);
    } finally {
      setGeneratingShotId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#090a0f] text-slate-100 p-6 select-text overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Visual Storyboard Frames</h2>
            <div className="flex items-center gap-2 mt-1">
              <select
                value={activeScene?.id || ''}
                onChange={(e) => setActiveSceneId(e.target.value)}
                className="px-2.5 py-1 bg-[#12141c] border border-border rounded text-xs text-cyan-300 font-semibold"
              >
                {scenes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Storyboard Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shots.length === 0 ? (
          <div className="col-span-full text-center py-16 text-slate-500 text-sm">
            <Film className="w-10 h-10 mx-auto mb-2 opacity-30" />
            No storyboard frames created yet. Add shots in the Shot List first.
          </div>
        ) : (
          shots.map((shot) => (
            <div
              key={shot.id}
              className="bg-[#12141c] border border-border rounded-xl overflow-hidden shadow-2xl flex flex-col hover:border-slate-600 transition"
            >
              {/* Storyboard Visual Frame Preview */}
              <div className="relative aspect-video bg-[#090a0f] border-b border-border/80 flex items-center justify-center overflow-hidden group">
                {shot.storyboard?.imageUrl ? (
                  <img
                    src={shot.storyboard.imageUrl}
                    alt={`Shot ${shot.shotNumber}`}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center text-center p-4 text-slate-500">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-40" />
                    <span className="text-xs">No visual frame rendered</span>
                  </div>
                )}

                {/* Overlay Badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded text-[11px] font-bold text-cyan-400 border border-white/10">
                  SHOT {shot.shotNumber < 10 ? `0${shot.shotNumber}` : shot.shotNumber}
                </div>

                <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded text-[11px] font-mono text-amber-300 border border-white/10">
                  {shot.lens}
                </div>

                {/* Regenerate Frame Button on Hover */}
                <button
                  onClick={() => handleGenerateFrame(shot)}
                  disabled={generatingShotId === shot.id}
                  className="absolute bottom-2 right-2 flex items-center gap-1 px-2.5 py-1 bg-cyan-600/90 hover:bg-cyan-500 text-white rounded text-xs font-semibold backdrop-blur-md opacity-90 transition"
                >
                  {generatingShotId === shot.id ? (
                    <>
                      <RotateCw className="w-3 h-3 animate-spin" /> Rendering...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" /> Render Frame
                    </>
                  )}
                </button>
              </div>

              {/* Storyboard Card Details */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between text-xs">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-sm">{shot.shotType}</span>
                    <span className="text-slate-400 text-[11px]">{shot.movement} • {shot.duration}s</span>
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2">{shot.description}</p>

                  {shot.dialogueLine && (
                    <p className="text-cyan-300 italic text-[10px] bg-cyan-500/10 p-1.5 rounded border border-cyan-500/20">
                      "{shot.dialogueLine}"
                    </p>
                  )}
                </div>

                {/* Prompt Inspection / Edit */}
                <div className="pt-2 border-t border-border/60">
                  {editingPromptShotId === shot.id ? (
                    <div className="space-y-1.5">
                      <textarea
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="Custom cinematic prompt..."
                        rows={2}
                        className="w-full p-1.5 bg-[#090a0f] border border-border rounded text-[11px] text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setEditingPromptShotId(null)}
                          className="px-2 py-0.5 text-[10px] text-slate-400"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleGenerateFrame(shot)}
                          className="px-2 py-0.5 bg-cyan-600 text-white rounded text-[10px] font-medium"
                        >
                          Render with Prompt
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingPromptShotId(shot.id);
                        setCustomPrompt(shot.storyboard?.prompt || '');
                      }}
                      className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-cyan-400 transition"
                    >
                      <Edit3 className="w-3 h-3" /> Edit Prompt Brief
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
