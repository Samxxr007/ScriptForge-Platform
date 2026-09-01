import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../stores/projectStore.ts';
import { api } from '../../lib/api.ts';
import { Clapperboard, Plus, Trash2, Sparkles, Download, ArrowUp, ArrowDown, Eye } from 'lucide-react';

export const ShotListPanel: React.FC = () => {
  const { scenes, activeSceneId, setActiveSceneId, setRightPanelTab } = useProjectStore();
  const [shots, setShots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const activeScene = scenes.find((s) => s.id === activeSceneId) || scenes[0];

  useEffect(() => {
    if (activeScene?.id) {
      loadShots(activeScene.id);
    }
  }, [activeScene?.id]);

  const loadShots = async (sceneId: string) => {
    setIsLoading(true);
    try {
      const res = await api.shots.list(sceneId);
      setShots(res.shots);
    } catch (err) {
      console.error('Failed to load shots:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddShot = async () => {
    if (!activeScene) return;
    try {
      const res = await api.shots.create(activeScene.id, {
        shotType: 'Medium Shot',
        lens: '50mm',
        movement: 'Static',
        duration: 4,
        description: 'Action description...',
      });
      setShots([...shots, res.shot]);
    } catch (err: any) {
      alert('Failed to add shot: ' + err.message);
    }
  };

  const handleGenerateShotListAI = async () => {
    if (!activeScene) return;
    setIsGeneratingAI(true);
    try {
      const res = await api.ai.generateShotList({
        sceneContent: activeScene.content,
        sceneTitle: activeScene.title,
      });

      // Insert generated shots into DB
      for (const s of res.shots) {
        await api.shots.create(activeScene.id, s);
      }
      loadShots(activeScene.id);
    } catch (err: any) {
      alert('AI Shot generation failed: ' + err.message);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleDelete = async (shotId: string) => {
    try {
      await api.shots.delete(shotId);
      setShots(shots.filter((s) => s.id !== shotId));
    } catch (err: any) {
      alert('Failed to delete shot: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#090a0f] text-slate-100 p-6 select-text overflow-y-auto">
      {/* Header with Scene Selector & Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Clapperboard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Cinematic Shot List</h2>
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

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateShotListAI}
            disabled={isGeneratingAI}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white rounded text-xs font-semibold shadow-md transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isGeneratingAI ? 'Directing Shots...' : 'AI Generate Shot List'}
          </button>

          <button
            onClick={handleAddShot}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181b26] hover:bg-zinc-800 text-slate-200 border border-border rounded text-xs font-medium transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Shot
          </button>

          {activeScene && (
            <a
              href={`/api/export/shot-list-pdf/${activeScene.id}`}
              download="shot-list.pdf"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-slate-200 rounded text-xs font-medium transition"
            >
              <Download className="w-3.5 h-3.5" /> Export PDF
            </a>
          )}
        </div>
      </div>

      {/* Production Shot List Table */}
      <div className="border border-border rounded-xl bg-[#12141c] overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-[#0e1017] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <th className="p-3 w-12 text-center">#</th>
              <th className="p-3 w-36">Shot Type</th>
              <th className="p-3 w-28">Lens</th>
              <th className="p-3 w-36">Movement</th>
              <th className="p-3 w-20">Duration</th>
              <th className="p-3">Description & Purpose</th>
              <th className="p-3 w-20 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-slate-200">
            {shots.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500">
                  <Clapperboard className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No shots planned for this scene yet. Click "AI Generate Shot List" to direct it.
                </td>
              </tr>
            ) : (
              shots.map((shot, idx) => (
                <tr key={shot.id} className="hover:bg-[#181b26] transition">
                  <td className="p-3 text-center font-bold text-cyan-400">{shot.shotNumber || idx + 1}</td>
                  <td className="p-3 font-semibold text-white">{shot.shotType}</td>
                  <td className="p-3 text-amber-300 font-mono">{shot.lens}</td>
                  <td className="p-3 text-slate-300">{shot.movement}</td>
                  <td className="p-3 text-slate-400">{shot.duration}s</td>
                  <td className="p-3 text-slate-300 text-[11px] leading-relaxed">
                    {shot.description}
                    {shot.dialogueLine && (
                      <div className="text-[10px] text-cyan-300 italic mt-0.5">"{shot.dialogueLine}"</div>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDelete(shot.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
