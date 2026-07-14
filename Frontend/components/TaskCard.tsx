import React from 'react';

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  assigned_to_id: number;
  assigned_to_name?: string; // For UI display
}

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onStatusChange?: (taskId: number, newStatus: 'pending' | 'in_progress' | 'completed') => void;
}

export default function TaskCard({ task, onEdit, onStatusChange }: TaskCardProps) {
  // Map statuses to distinct visual colors
  const statusColors = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  const statusDisplay = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col h-full group">
      <div className="flex justify-between items-start mb-3 gap-2">
        <h4 className="font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors" title={task.title}>
          {task.title}
        </h4>
        <span className={`text-xs px-2.5 py-1 rounded-full border font-bold whitespace-nowrap ${statusColors[task.status]}`}>
          {statusDisplay[task.status]}
        </span>
      </div>
      
      <p className="text-sm text-slate-600 flex-grow mb-5 line-clamp-3 leading-relaxed">
        {task.description}
      </p>

      <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 truncate">
          Assignee: <span className="text-slate-700">{task.assigned_to_name || `User ID: ${task.assigned_to_id}`}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Render status dropdown if onStatusChange is provided */}
          {onStatusChange && (
            <select
              value={task.status}
              onChange={(e) => onStatusChange(task.id, e.target.value as 'pending' | 'in_progress' | 'completed')}
              className="text-xs font-bold bg-white border border-slate-300 rounded-md px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer shadow-sm hover:bg-slate-50 transition-colors"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          )}

          {/* Render edit button if onEdit is provided */}
          {onEdit && (
            <button 
              onClick={() => onEdit(task)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline px-2 py-1 transition-colors"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
