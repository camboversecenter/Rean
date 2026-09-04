import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, Loader2, Users } from './Icons';
import { createMissionClass, deleteMissionClass } from '../services/missionService';
import { MissionClass } from '../types';
import toast from 'react-hot-toast';

interface MissionClassManagerProps {
  missionId: string;
  classes: MissionClass[];
  selectedClassId: string | null;
  onSelectClass: (id: string | null) => void;
  onUpdate: () => void;
}

const MissionClassManager: React.FC<MissionClassManagerProps> = ({
  missionId,
  classes,
  selectedClassId,
  onSelectClass,
  onUpdate,
}) => {
  const [state, setState] = useState({ title: '', isCreating: false });

  const handleCreateClass = async () => {
    if (!state.title.trim()) return;
    setState((s) => ({ ...s, isCreating: true }));
    try {
      await createMissionClass(missionId, state.title);
      setState({ title: '', isCreating: false });
      onUpdate();
      toast.success('Class created successfully');
    } catch (e) {
      toast.error('Failed to create class');
      setState((s) => ({ ...s, isCreating: false }));
    }
  };

  const handleDeleteClass = async (cid: string) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    try {
      await deleteMissionClass(cid);
      if (selectedClassId === cid) onSelectClass(null);
      onUpdate();
      toast.success('Class deleted');
    } catch (e) {
      toast.error('Failed to delete class');
    }
  };

  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-line overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-line bg-surface-2/50">
        <h3 className="font-bold text-content flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-primary" />
          គ្រប់គ្រងថ្នាក់ (Cohorts)
        </h3>
      </div>

      <div className="p-4 space-y-2 flex-1 overflow-y-auto max-h-[400px]">
        {classes.length === 0 ? (
          <div className="text-center py-6 text-content-faint text-xs italic">
            មិនទាន់មានថ្នាក់រៀនទេ។ បង្កើតមួយឥឡូវនេះ!
          </div>
        ) : (
          classes.map((c) => (
            <div
              key={c.id}
              className={`group flex items-center justify-between p-1 rounded-xl transition-all ${selectedClassId === c.id ? 'bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-surface-2'}`}
            >
              <button
                type="button"
                onClick={() => onSelectClass(c.id)}
                className="flex-1 text-left px-3 py-2 text-sm font-medium text-content-soft truncate flex items-center"
              >
                <Users className="h-4 w-4 mr-2 text-content-faint" />
                {c.title}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteClass(c.id)}
                className="p-2 text-content-faint hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                title="Delete Class"
                aria-label={`Delete Class ${c.title}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-line bg-surface-2">
        <label
          htmlFor="newClassTitle"
          className="text-[10px] font-bold text-content-muted uppercase mb-2 block"
        >
          បង្កើតថ្នាក់ថ្មី
        </label>
        <div className="flex gap-2">
          <input
            id="newClassTitle"
            type="text"
            className="flex-1 p-2.5 border border-line-strong rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 bg-surface shadow-sm"
            placeholder="ឈ្មោះថ្នាក់ (ឧ. ជំនាន់ទី ១)"
            value={state.title}
            onChange={(e) => setState((s) => ({ ...s, title: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateClass()}
          />
          <button
            type="button"
            onClick={handleCreateClass}
            disabled={state.isCreating || !state.title.trim()}
            className="bg-gray-900 dark:bg-surface-3 text-white p-2.5 rounded-xl hover:bg-black transition-colors disabled:opacity-50 shadow-md flex items-center justify-center min-w-[44px]"
            aria-label="Create Class"
          >
            {state.isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MissionClassManager;
