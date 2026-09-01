import React, { useState } from 'react';
import { useProjectStore } from '../../stores/projectStore.ts';
import { api } from '../../lib/api.ts';
import { Users, Plus, Trash2, X, Sparkles, User, Palette } from 'lucide-react';

export const CharacterPanel: React.FC = () => {
  const { project, setProject, setRightPanelTab } = useProjectStore();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedChar, setSelectedChar] = useState<any>(null);

  // New character form state
  const [name, setName] = useState('');
  const [role, setRole] = useState('Supporting');
  const [age, setAge] = useState('');
  const [personality, setPersonality] = useState('');
  const [motivation, setMotivation] = useState('');
  const [faceDescription, setFaceDescription] = useState('');
  const [clothing, setClothing] = useState('');
  const [colorPalette, setColorPalette] = useState('#06b6d4');

  const characters = project?.characters || [];

  const handleCreateCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !project) return;

    try {
      const res = await api.characters.create(project.id, {
        name,
        role,
        age,
        personality,
        motivation,
        faceDescription,
        clothing,
        colorPalette,
      });

      const updated = [...characters, res.character];
      setProject({ ...project, characters: updated });
      setIsCreating(false);
      resetForm();
    } catch (err: any) {
      alert('Failed to create character: ' + err.message);
    }
  };

  const handleDelete = async (charId: string) => {
    if (!confirm('Delete this character profile?')) return;
    try {
      await api.characters.delete(charId);
      const updated = characters.filter((c: any) => c.id !== charId);
      setProject({ ...project, characters: updated });
      if (selectedChar?.id === charId) setSelectedChar(null);
    } catch (err: any) {
      alert('Failed to delete character: ' + err.message);
    }
  };

  const resetForm = () => {
    setName('');
    setAge('');
    setPersonality('');
    setMotivation('');
    setFaceDescription('');
    setClothing('');
  };

  return (
    <div className="flex flex-col h-full bg-[#12141c] text-slate-100 border-l border-border select-text">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/80 bg-[#0e1017]">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Character Database</h3>
        </div>
        <button
          onClick={() => setRightPanelTab(null)}
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-zinc-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Trigger */}
      <div className="p-3 border-b border-border/60 bg-[#0f1118]">
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded text-xs font-medium transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add New Character
          </button>
        ) : (
          <form onSubmit={handleCreateCharacter} className="space-y-2 text-xs">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Character Name (e.g. MAYA VANCE)"
              className="w-full px-2.5 py-1.5 bg-[#090a0f] border border-border rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-2 py-1.5 bg-[#090a0f] border border-border rounded text-slate-200"
              >
                <option>Protagonist</option>
                <option>Antagonist</option>
                <option>Supporting</option>
                <option>Mentor</option>
              </select>
              <input
                type="text"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Age (e.g. 32)"
                className="px-2.5 py-1.5 bg-[#090a0f] border border-border rounded text-slate-100 placeholder-slate-500"
              />
            </div>
            <textarea
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              placeholder="Personality traits & quirks..."
              rows={2}
              className="w-full px-2.5 py-1.5 bg-[#090a0f] border border-border rounded text-slate-100 placeholder-slate-500"
            />
            <textarea
              value={faceDescription}
              onChange={(e) => setFaceDescription(e.target.value)}
              placeholder="Face & physical description (for Visual Consistency)..."
              rows={2}
              className="w-full px-2.5 py-1.5 bg-[#090a0f] border border-border rounded text-slate-100 placeholder-slate-500"
            />
            <input
              type="text"
              value={clothing}
              onChange={(e) => setClothing(e.target.value)}
              placeholder="Costume & style (e.g. Slate flight suit)"
              className="w-full px-2.5 py-1.5 bg-[#090a0f] border border-border rounded text-slate-100 placeholder-slate-500"
            />
            <div className="flex justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-2.5 py-1 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button type="submit" className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium">
                Save Character
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Characters List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {characters.map((char: any) => (
          <div
            key={char.id}
            onClick={() => setSelectedChar(char)}
            className="p-3.5 rounded-lg bg-[#181b26] border border-border hover:border-slate-600 transition cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: char.colorPalette || '#06b6d4' }}
                />
                <h4 className="font-bold text-xs text-white">{char.name}</h4>
              </div>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-slate-300 font-medium">
                {char.role}
              </span>
            </div>

            {char.personality && (
              <p className="text-[11px] text-slate-300 line-clamp-2">
                <strong className="text-slate-400">Traits:</strong> {char.personality}
              </p>
            )}

            {/* Visual Consistency tags */}
            {char.clothing && (
              <p className="text-[10px] text-slate-400 italic">
                <strong>Wardrobe:</strong> {char.clothing}
              </p>
            )}

            <div className="flex items-center justify-between text-[10px] text-cyan-400/80 pt-1.5 border-t border-border/40">
              <span>Appears in script scenes</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(char.id);
                }}
                className="p-1 text-slate-500 hover:text-rose-400 transition"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
