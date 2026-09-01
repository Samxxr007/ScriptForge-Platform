import React, { useState } from 'react';
import { useProjectStore } from '../../stores/projectStore.ts';
import { api } from '../../lib/api.ts';
import { Users, UserPlus, Trash2, X, Shield, Check } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const { project, setProject } = useProjectStore();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('WRITER');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !project) return null;

  const members = project.members || [];

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const res = await api.projects.addMember(project.id, email.trim(), role);
      const updated = [...members, res.member];
      setProject({ ...project, members: updated });
      setEmail('');
      alert(`Invitation sent to ${email}!`);
    } catch (err: any) {
      alert('Failed to invite member: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      const res = await api.projects.updateMemberRole(project.id, memberId, newRole);
      const updated = members.map((m: any) => (m.id === memberId ? res.member : m));
      setProject({ ...project, members: updated });
    } catch (err: any) {
      alert('Failed to update role: ' + err.message);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remove this collaborator from the project?')) return;
    try {
      await api.projects.removeMember(project.id, memberId);
      const updated = members.filter((m: any) => m.id !== memberId);
      setProject({ ...project, members: updated });
    } catch (err: any) {
      alert('Failed to remove member: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-[#12141c] border border-border rounded-xl shadow-2xl p-6 space-y-5 text-slate-100">
        <div className="flex justify-between items-center border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">Share "{project.name}"</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded hover:bg-zinc-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Invite Form */}
        <form onSubmit={handleInvite} className="space-y-3">
          <label className="text-xs font-semibold text-slate-300">Invite Collaborator</label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@scriptforge.local"
              className="flex-1 px-3 py-2 bg-[#090a0f] border border-border rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="px-3 py-2 bg-[#090a0f] border border-border rounded-lg text-xs text-slate-200"
            >
              <option value="WRITER">Writer</option>
              <option value="EDITOR">Editor</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-1.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg text-xs transition shadow-md"
          >
            <UserPlus className="w-4 h-4" />
            {isLoading ? 'Inviting...' : 'Send Project Invite'}
          </button>
        </form>

        {/* Current Members List */}
        <div className="space-y-2 pt-3 border-t border-border/60">
          <span className="text-xs font-semibold text-slate-300">Project Members ({members.length})</span>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {members.map((member: any) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#090a0f] border border-border text-xs"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={
                      member.user?.avatar ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.user?.name || 'U')}`
                    }
                    alt={member.user?.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <div>
                    <div className="font-semibold text-slate-200">{member.user?.name || 'User'}</div>
                    <div className="text-[10px] text-slate-500">{member.user?.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={member.role}
                    onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                    className="px-2 py-1 bg-zinc-800 border border-border rounded text-[11px] text-slate-200"
                  >
                    <option value="OWNER">Owner</option>
                    <option value="WRITER">Writer</option>
                    <option value="EDITOR">Editor</option>
                    <option value="VIEWER">Viewer</option>
                  </select>

                  {member.role !== 'OWNER' && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
