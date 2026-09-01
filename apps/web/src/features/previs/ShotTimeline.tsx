import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, Film, Camera } from 'lucide-react';

interface ShotTimelineProps {
  shots: any[];
}

export const ShotTimeline: React.FC<ShotTimelineProps> = ({ shots }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayheadSeconds, setCurrentPlayheadSeconds] = useState(0);

  const totalDuration = shots.reduce((acc, s) => acc + (s.duration || 4), 0) || 20;

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="bg-[#12141c] border border-border rounded-xl p-4 shadow-2xl space-y-3 select-none">
      {/* Controls Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="p-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-md"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>
          <button
            onClick={() => setCurrentPlayheadSeconds(0)}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-zinc-800 transition"
            title="Reset to 00:00"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-cyan-400 font-bold text-sm">
            00:{currentPlayheadSeconds < 10 ? `0${currentPlayheadSeconds}` : currentPlayheadSeconds} / 00:
            {totalDuration < 10 ? `0${totalDuration}` : totalDuration}
          </span>
        </div>

        <span className="text-[11px] text-slate-400">Scrub timeline to inspect shot cuts & camera sequence</span>
      </div>

      {/* Multi-Track Timeline */}
      <div className="space-y-2 pt-2 border-t border-border/60">
        {/* Track 1: Cameras & Shots */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-semibold">
            <Camera className="w-3 h-3 text-cyan-400" />
            <span>Camera Sequence</span>
          </div>

          <div className="relative h-10 bg-[#090a0f] rounded-lg border border-border/80 flex overflow-hidden">
            {shots.map((shot, idx) => {
              const widthPct = ((shot.duration || 4) / totalDuration) * 100;
              return (
                <div
                  key={shot.id || idx}
                  style={{ width: `${widthPct}%` }}
                  className="h-full border-r border-border bg-cyan-500/10 hover:bg-cyan-500/20 transition p-1.5 flex flex-col justify-between overflow-hidden cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-cyan-300 truncate">
                    #{shot.shotNumber || idx + 1} {shot.shotType}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 truncate">{shot.lens} • {shot.movement}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Track 2: Dialogue & Action Beats */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-semibold">
            <Volume2 className="w-3 h-3 text-amber-400" />
            <span>Audio & Dialogue Track</span>
          </div>

          <div className="relative h-7 bg-[#090a0f] rounded-lg border border-border/80 flex overflow-hidden">
            {shots.map((shot, idx) => {
              const widthPct = ((shot.duration || 4) / totalDuration) * 100;
              return (
                <div
                  key={shot.id || idx}
                  style={{ width: `${widthPct}%` }}
                  className="h-full border-r border-border bg-amber-500/5 p-1 flex items-center overflow-hidden"
                >
                  <span className="text-[9px] text-amber-300/80 truncate italic">
                    {shot.dialogueLine || shot.purpose || 'Ambient audio'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
