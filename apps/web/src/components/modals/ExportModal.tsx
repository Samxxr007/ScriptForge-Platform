import React, { useState } from 'react';
import { useProjectStore } from '../../stores/projectStore.ts';
import { Download, FileText, FileCode, CheckCircle2, Clock, X, Film, File } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { document, project } = useProjectStore();
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'fdx' | 'fountain' | 'docx'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen || !document) return null;

  const formats = [
    {
      id: 'pdf',
      name: 'Screenplay PDF',
      ext: '.pdf',
      desc: 'Industry standard Courier 12pt format with precise title page and margins.',
      icon: FileText,
      color: 'text-rose-400',
    },
    {
      id: 'fdx',
      name: 'Final Draft (FDX)',
      ext: '.fdx',
      desc: 'Native Final Draft XML format with structural tags (<SceneHeading>, <Dialogue>).',
      icon: Film,
      color: 'text-cyan-400',
    },
    {
      id: 'fountain',
      name: 'Fountain Text',
      ext: '.fountain',
      desc: 'Pure plain-text screenplay markup syntax compatible with Highland and Slugline.',
      icon: FileCode,
      color: 'text-amber-400',
    },
    {
      id: 'docx',
      name: 'Microsoft Word (DOCX)',
      ext: '.docx',
      desc: 'Formatted Word document with custom paragraph styles for production read-throughs.',
      icon: File,
      color: 'text-blue-400',
    },
  ];

  const handleExport = () => {
    setIsExporting(true);
    setStatusMessage('Preparing screenplay export...');

    setTimeout(() => {
      // Trigger download from backend API
      const downloadUrl = `/api/export/${selectedFormat}/${document.id}`;
      const a = window.document.createElement('a');
      a.href = downloadUrl;
      a.download = `${project?.name || 'Screenplay'}.${selectedFormat}`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);

      setIsExporting(false);
      setStatusMessage('Export completed!');
      setTimeout(() => {
        onClose();
        setStatusMessage('');
      }, 1000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-[#12141c] border border-border rounded-xl shadow-2xl p-6 space-y-5 text-slate-100">
        <div className="flex justify-between items-center border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">Export Screenplay</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded hover:bg-zinc-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selector Grid */}
        <div className="grid grid-cols-2 gap-3">
          {formats.map((f) => {
            const Icon = f.icon;
            const isSelected = selectedFormat === f.id;
            return (
              <div
                key={f.id}
                onClick={() => setSelectedFormat(f.id as any)}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500 ring-2 ring-cyan-500/20'
                    : 'bg-[#090a0f] border-border hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className={`w-4 h-4 ${f.color}`} />
                    <span className="font-bold text-xs text-white">{f.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">{f.desc}</p>
                </div>
                <div className="mt-2 text-[10px] font-mono text-slate-500 uppercase">{f.ext} file</div>
              </div>
            );
          })}
        </div>

        {/* Action Button & Status */}
        <div className="pt-3 border-t border-border/60 flex flex-col gap-2">
          {statusMessage && (
            <div className="flex items-center justify-center gap-2 text-xs text-cyan-300 animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              <span>{statusMessage}</span>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 text-xs text-slate-400 hover:text-white">
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-semibold text-xs rounded-lg shadow-lg shadow-cyan-900/30 transition"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Generating Document...' : `Download ${selectedFormat.toUpperCase()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
