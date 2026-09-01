import React, { useState, useEffect, useRef } from 'react';
import { useProjectStore } from '../../stores/projectStore.ts';
import { api } from '../../lib/api.ts';
import { Camera, Move, RotateCcw, Sliders, Layers, Sparkles, Film, Play, Pause, ChevronRight } from 'lucide-react';

export const ScenePrevisWorkspace: React.FC = () => {
  const { scenes, activeSceneId, setActiveSceneId } = useProjectStore();
  const activeScene = scenes.find((s) => s.id === activeSceneId) || scenes[0];

  // Camera settings state (Deterministic real-time simulation)
  const [selectedCameraId, setSelectedCameraId] = useState<string>('cam-1');
  const [lens, setLens] = useState('50mm');
  const [fov, setFov] = useState(45);
  const [height, setHeight] = useState(1.6);
  const [pan, setPan] = useState(0);
  const [tilt, setTilt] = useState(0);

  // Scene Top-Down layout state
  const [characters, setCharacters] = useState<any[]>([
    { id: 'c1', name: 'MAYA VANCE', x: 220, y: 180, color: '#06b6d4' },
    { id: 'c2', name: 'DANIEL CORDE', x: 380, y: 180, color: '#3b82f6' },
  ]);

  const [cameras, setCameras] = useState<any[]>([
    { id: 'cam-1', name: 'Camera 01 - Master Wide', x: 300, y: 320, angle: 0, lens: '24mm' },
    { id: 'cam-2', name: 'Camera 02 - Over-Shoulder Maya', x: 190, y: 220, angle: -30, lens: '50mm' },
    { id: 'cam-3', name: 'Camera 03 - Close-Up Daniel', x: 410, y: 220, angle: 30, lens: '85mm' },
  ]);

  const [propsList, setPropsList] = useState<any[]>([
    { id: 'p1', name: 'Terminal Console', x: 270, y: 150, width: 120, height: 40, color: '#334155' },
    { id: 'p2', name: 'Cryo Stasis Rack', x: 100, y: 80, width: 60, height: 140, color: '#475569' },
  ]);

  const [activePreset, setActivePreset] = useState('Medium Shot');
  const [draggingItem, setDraggingItem] = useState<{ type: 'char' | 'cam' | 'prop'; id: string } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Camera presets
  const presets = [
    { name: 'Extreme Wide', lens: '18mm', fov: 75, height: 2.2 },
    { name: 'Wide Establishing', lens: '24mm', fov: 65, height: 1.8 },
    { name: 'Medium Shot', lens: '35mm', fov: 50, height: 1.6 },
    { name: 'Over-the-Shoulder', lens: '50mm', fov: 40, height: 1.5 },
    { name: 'Close-Up', lens: '85mm', fov: 28, height: 1.6 },
    { name: 'Extreme Close-Up', lens: '135mm', fov: 18, height: 1.6 },
  ];

  const applyPreset = (preset: any) => {
    setActivePreset(preset.name);
    setLens(preset.lens);
    setFov(preset.fov);
    setHeight(preset.height);
  };

  // Top-Down Canvas Dragging Handler
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingItem || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(20, Math.min(rect.width - 20, e.clientX - rect.left));
    const y = Math.max(20, Math.min(rect.height - 20, e.clientY - rect.top));

    if (draggingItem.type === 'char') {
      setCharacters(characters.map((c) => (c.id === draggingItem.id ? { ...c, x, y } : c)));
    } else if (draggingItem.type === 'cam') {
      setCameras(cameras.map((cam) => (cam.id === draggingItem.id ? { ...cam, x, y } : cam)));
    }
  };

  const selectedCam = cameras.find((c) => c.id === selectedCameraId) || cameras[0];

  return (
    <div className="flex flex-col h-full bg-[#090a0f] text-slate-100 p-6 select-none overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Cinematic Previsualization Studio</h2>
            <p className="text-xs text-slate-400">Interactive 3D Camera Simulation & Top-Down Set Blocking</p>
          </div>
        </div>

        {/* Scene Selector */}
        <select
          value={activeScene?.id || ''}
          onChange={(e) => setActiveSceneId(e.target.value)}
          className="px-3 py-1.5 bg-[#12141c] border border-border rounded text-xs text-cyan-300 font-semibold"
        >
          {scenes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </div>

      {/* Main Previs Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* LEFT & CENTER: TOP-DOWN BLOCKING CANVAS (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-[#12141c] border border-border rounded-xl shadow-2xl overflow-hidden">
          <div className="px-4 py-2.5 bg-[#0e1017] border-b border-border flex justify-between items-center text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-2">
              <Move className="w-4 h-4 text-cyan-400" />
              <span>Top-Down Stage Floor Plan (Drag actors & cameras)</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Grid Scale: 1m = 30px</span>
          </div>

          {/* Interactive 2.5D Canvas */}
          <div
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseUp={() => setDraggingItem(null)}
            className="relative flex-1 min-h-[380px] bg-[#0b0d13] p-4 cursor-crosshair overflow-hidden"
            style={{
              backgroundImage: 'radial-gradient(#1e2433 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          >
            {/* Props / Furniture */}
            {propsList.map((p) => (
              <div
                key={p.id}
                style={{
                  left: `${p.x}px`,
                  top: `${p.y}px`,
                  width: `${p.width}px`,
                  height: `${p.height}px`,
                  backgroundColor: p.color,
                }}
                className="absolute rounded border border-slate-600 flex items-center justify-center text-[10px] text-slate-300 font-mono shadow-md opacity-80"
              >
                {p.name}
              </div>
            ))}

            {/* Character Markers */}
            {characters.map((char) => (
              <div
                key={char.id}
                onMouseDown={() => setDraggingItem({ type: 'char', id: char.id })}
                style={{ left: `${char.x - 14}px`, top: `${char.y - 14}px` }}
                className="absolute z-20 flex flex-col items-center cursor-grab active:cursor-grabbing group"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-slate-950 font-bold text-xs shadow-lg border-2 border-white ring-4 ring-cyan-500/20"
                  style={{ backgroundColor: char.color }}
                >
                  ●
                </div>
                <span className="text-[10px] font-bold text-white bg-black/80 px-1.5 py-0.5 rounded mt-1 whitespace-nowrap shadow">
                  {char.name}
                </span>
              </div>
            ))}

            {/* Camera Frustums & Objects */}
            {cameras.map((cam) => {
              const isSelected = cam.id === selectedCameraId;
              return (
                <div
                  key={cam.id}
                  onMouseDown={() => {
                    setSelectedCameraId(cam.id);
                    setDraggingItem({ type: 'cam', id: cam.id });
                  }}
                  style={{ left: `${cam.x - 16}px`, top: `${cam.y - 16}px` }}
                  className={`absolute z-30 flex flex-col items-center cursor-grab active:cursor-grabbing ${
                    isSelected ? 'scale-110' : 'opacity-80'
                  }`}
                >
                  <div
                    className={`p-2 rounded-full border-2 transition shadow-xl ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 border-white ring-4 ring-cyan-400/40'
                        : 'bg-zinc-800 text-cyan-400 border-border hover:border-cyan-400'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold px-1 rounded mt-1 whitespace-nowrap ${
                      isSelected ? 'bg-cyan-400 text-slate-950' : 'bg-black/80 text-slate-300'
                    }`}
                  >
                    {cam.name} ({cam.lens})
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: REAL-TIME PERSPECTIVE CAMERA SIMULATOR (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Real-time Viewport Box */}
          <div className="bg-[#12141c] border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-4 py-2.5 bg-[#0e1017] border-b border-border flex justify-between items-center text-xs font-semibold text-slate-300">
              <span className="text-cyan-400 font-bold">POV: {selectedCam.name}</span>
              <span className="text-amber-400 font-mono">{lens} • {fov}° FOV</span>
            </div>

            {/* Simulated Perspective Frame */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
              {/* Simulated 3D Depth Viewport */}
              <div
                className="w-full h-full bg-gradient-to-b from-[#091522] via-[#0b101d] to-[#04060a] flex items-center justify-center relative"
                style={{
                  perspective: `${1000 - fov * 8}px`,
                }}
              >
                {/* Visual Depth Grid */}
                <div
                  className="w-48 h-48 border border-cyan-500/30 rounded-lg flex items-center justify-center transition-all duration-200"
                  style={{
                    transform: `translateZ(${fov * 2}px) rotateY(${pan}deg) rotateX(${tilt}deg)`,
                  }}
                >
                  <div className="text-center p-4">
                    <div className="w-12 h-12 mx-auto rounded-full bg-cyan-400/20 border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold text-sm mb-2 shadow-lg animate-pulse">
                      MAYA
                    </div>
                    <span className="text-[11px] text-slate-300 font-mono">Focal Distance: 2.1m</span>
                  </div>
                </div>

                {/* 2.39:1 Anamorphic Frame Guide Overlay */}
                <div className="absolute inset-0 border-y-[18px] border-black/80 pointer-events-none" />
                <div className="absolute top-4 right-4 px-2 py-0.5 bg-red-600/80 rounded text-[9px] font-bold text-white animate-pulse">
                  REC • 24.00 FPS
                </div>
              </div>
            </div>

            {/* Quick Lens & Preset Selectors */}
            <div className="p-4 space-y-3 bg-[#0e1017]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Camera Preset
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {presets.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => applyPreset(p)}
                    className={`px-2 py-1.5 rounded text-[11px] font-medium border transition ${
                      activePreset === p.name
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-[#181b26] border-border text-slate-300 hover:bg-zinc-800'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              {/* Sliders */}
              <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Field of View (FOV)</span>
                  <span className="font-mono text-cyan-400">{fov}°</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="90"
                  value={fov}
                  onChange={(e) => setFov(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />

                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Camera Height</span>
                  <span className="font-mono text-cyan-400">{height}m</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
