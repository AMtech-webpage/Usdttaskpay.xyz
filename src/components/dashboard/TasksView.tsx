import React from 'react';
import { MicroTask } from '../../lib/supabase';
import { Smartphone, Loader2, CheckCircle, ExternalLink } from 'lucide-react';

interface TasksViewProps {
  tasks: MicroTask[];
  isLoading: boolean;
  onCompleteTask: (task: MicroTask) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  isLoading,
  onCompleteTask,
}) => {
  return (
    <div className="space-y-6">
      <div className="mb-6 flex items-center space-x-2">
        <Smartphone className="h-5 w-5 text-cyan-300" />
        <h2 className="font-display text-xl font-bold text-white">Micro-Tasks & Web3 Integrations</h2>
      </div>

      {isLoading ? (
        <div className="flex h-20 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/10">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-slate-500 text-sm bg-slate-950/20">
          No pending micro-tasks available. Check back shortly.
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-glow-blue transition-all ${
                task.completed 
                  ? 'border-emerald-500/20 bg-emerald-950/10' 
                  : 'border-slate-800 bg-slate-950/50 hover:bg-slate-950/80'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className={`rounded px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase ${
                    task.type === 'twitter' 
                      ? 'bg-sky-500/10 text-sky-400' 
                      : task.type === 'telegram'
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'bg-red-500/10 text-red-500'
                  }`}>
                    {task.type}
                  </span>
                  <h4 className="text-sm font-semibold text-slate-200">{task.title}</h4>
                </div>
                <p className="mt-1.5 text-xs text-slate-400 max-w-lg leading-relaxed">{task.description}</p>
              </div>

              <div className="flex items-center space-x-3 self-end sm:self-auto shrink-0 pt-2 sm:pt-0">
                <div className="text-right">
                  <span className="block text-[9px] font-mono text-slate-500">Yield (80%)</span>
                  <span className={`font-display text-sm font-bold ${
                    task.completed ? 'text-slate-500' : 'text-emerald-400'
                  }`}>
                    +{task.reward.toFixed(4)} USDT
                  </span>
                </div>

                {task.completed ? (
                  <div className="flex items-center space-x-1 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Claimed</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onCompleteTask(task)}
                    className="cursor-pointer flex items-center space-x-1.5 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <span>Verify Task</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
