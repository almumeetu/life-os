import React, { useState } from "react";
import { 
  PlusCircle, Target, Calendar, Trash2, Edit, Save, 
  CheckSquare, Square, RefreshCw, Star, CheckCircle2 
} from "lucide-react";
import { Goal } from "../types";

interface GoalsHubProps {
  goals: Goal[];
  onSaveGoals: (updated: Goal[]) => void;
}

export default function GoalsHub({ goals, onSaveGoals }: GoalsHubProps) {
  
  const [activeTab, setActiveTab] = useState<Goal["timeframe"]>("Weekly");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form inputs
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [timeframe, setTimeframe] = useState<Goal["timeframe"]>("Weekly");

  const handleToggleComplete = (id: string) => {
    const updated = goals.map(g => {
      if (g.id === id) {
        return { ...g, completed: !g.completed };
      }
      return g;
    });
    onSaveGoals(updated);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      title,
      timeframe,
      completed: false,
      dueDate: dueDate || undefined
    };

    onSaveGoals([...goals, newGoal]);
    resetForm();
  };

  const handleEdit = (g: Goal) => {
    setEditingId(g.id);
    setTitle(g.title);
    setDueDate(g.dueDate || "");
    setTimeframe(g.timeframe);
    setIsAdding(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    const updated = goals.map(g => {
      if (g.id === editingId) {
        return {
          ...g,
          title,
          timeframe,
          dueDate: dueDate || undefined
        };
      }
      return g;
    });

    onSaveGoals(updated);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm("Destroy this goal?")) {
      onSaveGoals(goals.filter(g => g.id !== id));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setIsAdding(false);
    setTitle("");
    setDueDate("");
    setTimeframe("Weekly");
  };

  const tabs: Goal["timeframe"][] = ["Daily", "Weekly", "Monthly", "Yearly"];

  const filteredGoals = goals.filter(g => g.timeframe === activeTab);
  const completedCount = filteredGoals.filter(g => g.completed).length;
  const totalCount = filteredGoals.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6" id="goals-hub">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-100 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">Goals & Checklists</h1>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">Formulate, catalog, track, and complete professional, personal, or learning milestones.</p>
        </div>
        
        <button
          onClick={() => { resetForm(); setIsAdding(true); }}
          className="text-xs font-semibold px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center space-x-1.5 self-start sm:self-center transition-all shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Goal Vision</span>
        </button>
      </div>

      {/* Adding / Editing Modal Panel */}
      {isAdding && (
        <form onSubmit={editingId ? handleUpdate : handleCreate} className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm max-w-xl text-xs space-y-4">
          <h3 className="font-bold text-neutral-700 dark:text-neutral-200">
            {editingId ? "Modify Goal Milestone" : "Envision New Goal"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-neutral-500">Goal Description</label>
              <input 
                type="text" 
                placeholder="e.g. Accomplish GCP Professional Architect certificate exam" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
                className="w-full p-2.5 border bg-white dark:bg-zinc-850 rounded-xl outline-none" 
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-500">Focal Duration</label>
              <select 
                value={timeframe} 
                onChange={e => setTimeframe(e.target.value as any)}
                className="w-full p-2.5 border bg-white dark:bg-zinc-850 rounded-xl outline-none"
              >
                {tabs.map(t => (
                  <option key={t} value={t}>{t} Target</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-500">Target Completion Date (Optional)</label>
              <input 
                type="date" 
                value={dueDate} 
                onChange={e => setDueDate(e.target.value)} 
                className="w-full p-2.5 border bg-white dark:bg-zinc-850 rounded-xl outline-none" 
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t">
            <button 
              type="button" 
              onClick={resetForm} 
              className="px-4 py-2 border rounded-xl text-neutral-500"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold"
            >
              {editingId ? "Update Vision" : "Enact Goal"}
            </button>
          </div>
        </form>
      )}

      {/* Segment tabs */}
      <div className="flex items-center space-x-1.5 border-b border-neutral-100 dark:border-zinc-850 pb-2 text-xs">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg border font-bold transition-all ${
              activeTab === tab
                ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-900"
                : "border-transparent text-neutral-500 hover:bg-neutral-50"
            }`}
          >
            {tab} Focus
          </button>
        ))}
      </div>

      {/* Progress and Dashboard metric card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Progress gauge card */}
        <div className="bg-neutral-50/50 dark:bg-zinc-900/50 border rounded-2xl p-5 text-xs flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-neutral-700 dark:text-neutral-200 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
              <Target className="w-4 h-4 text-indigo-500" />
              <span>{activeTab} Progress Checklist</span>
            </h3>
            <p className="text-neutral-400">Completion rate of active target parameters.</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-neutral-600 dark:text-neutral-450">
              <span>{completedCount} of {totalCount} completed</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-neutral-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Core Checklist grid items */}
        <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 text-xs">
          <h3 className="text-neutral-400 font-bold uppercase tracking-wider text-[10px]">{activeTab} Operational Items</h3>

          <div className="space-y-2.5">
            {filteredGoals.length === 0 ? (
              <div className="text-center py-8 text-neutral-400 font-semibold">
                No active targets in this duration focus. Click "New Goal Vision" to establish goals.
              </div>
            ) : (
              filteredGoals.map(goal => (
                <div 
                  key={goal.id} 
                  className={`p-3.5 border rounded-xl flex items-center justify-between transition-all group ${
                    goal.completed 
                      ? "bg-neutral-50/40 border-neutral-150 dark:bg-zinc-950/10 text-neutral-400" 
                      : "bg-white border-neutral-200 hover:border-indigo-300 shadow-xs"
                  }`}
                >
                  <div className="flex items-start space-x-3 text-left">
                    <button 
                      onClick={() => handleToggleComplete(goal.id)}
                      className="p-1 text-neutral-400 hover:text-indigo-600 transition-colors"
                      title={goal.completed ? "Mark incomplete" : "Mark completed"}
                    >
                      {goal.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <div className="w-5 h-5 border-2 rounded-full hover:border-indigo-400 transition-all" />
                      )}
                    </button>
                    <div>
                      <p className={`font-bold text-neutral-700 dark:text-neutral-200 ${goal.completed ? "line-through opacity-60" : ""}`}>
                        {goal.title}
                      </p>
                      {goal.dueDate && (
                        <span className="text-[10px] font-mono text-neutral-400 flex items-center mt-1">
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          Complete by: {goal.dueDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(goal)}
                      className="p-1 border rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => handleDelete(goal.id)}
                      className="p-1 border rounded hover:bg-neutral-100 text-neutral-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
