"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import TaskCard, { Task } from "../../components/TaskCard";
import api from "../../lib/axios";
import useSWR from "swr";

const fetcher = (url: string) => api.get(url).then(res => res.data);

interface KanbanColumnProps {
  title: string;
  count: number;
  headerColor: string;
  items: Task[];
  isLoading: boolean;
  onStatusChange: (taskId: number, newStatus: 'pending' | 'in_progress' | 'completed') => void;
}

const KanbanColumn = ({ title, count, headerColor, items, isLoading, onStatusChange }: KanbanColumnProps) => (
  <div className="flex flex-col bg-slate-100/50 rounded-2xl border border-slate-200 overflow-hidden h-[70vh] min-h-[500px]">
    <div className={`px-5 py-4 border-b border-slate-200 flex justify-between items-center ${headerColor}`}>
      <h2 className="font-extrabold text-slate-800 tracking-tight">{title}</h2>
      <span className="bg-white text-slate-700 text-xs font-extrabold px-3 py-1 rounded-full shadow-sm">{count}</span>
    </div>
    
    <div className="p-4 flex-grow flex flex-col gap-4 overflow-y-auto hide-scrollbar">
      {isLoading && items.length === 0 ? (
        <div className="animate-pulse bg-white rounded-xl h-32 w-full"></div>
      ) : items.map(task => (
        <div key={task.id} className="transform transition-all duration-300 hover:-translate-y-1">
          <TaskCard task={task} onStatusChange={onStatusChange} />
        </div>
      ))}
      
      {!isLoading && items.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-slate-400 font-medium italic border-2 border-dashed border-slate-300 rounded-xl p-8 opacity-70">
          <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>No tasks here</p>
        </div>
      )}
    </div>
  </div>
);

export default function MemberDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auth Protection - strictly for 'team_member'
  useEffect(() => {
    if (user === null && !localStorage.getItem("token")) {
      router.push("/login");
    } else if (user && user.role !== "team_member") {
      router.push("/");
    }
  }, [user, router]);

  // Using SWR for real data fetching. 
  // We use fallbackData to populate the board while developing/if endpoint fails.
  const { data: tasksData, error: tasksError, mutate, isLoading } = useSWR(
    user?.role === "team_member" ? "/tasks" : null,
    fetcher,
    {
       fallbackData: {
         tasks: [
          { id: 201, project_id: 1, title: "Setup Local Environment", description: "Install Node.js, clone the repository, and run npm install.", status: "completed", assigned_to_id: user?.id || 0, assigned_to_name: user?.name },
          { id: 202, project_id: 1, title: "Implement Kanban UI", description: "Design a 3-column responsive flexbox layout in Tailwind.", status: "in_progress", assigned_to_id: user?.id || 0, assigned_to_name: user?.name },
          { id: 203, project_id: 2, title: "Write Unit Tests", description: "Ensure the AuthContext works correctly with mock localStorage.", status: "pending", assigned_to_id: user?.id || 0, assigned_to_name: user?.name },
         ]
       }
    }
  );

  const tasks: Task[] = Array.isArray(tasksData) ? tasksData : tasksData?.tasks || [];

  // --- OPTIMISTIC UI STATUS UPDATE ---
  const handleStatusChange = async (taskId: number, newStatus: 'pending' | 'in_progress' | 'completed') => {
    setErrorMsg(null);

    // 1. Keep a backup of the original status
    const originalTask = tasks.find(t => t.id === taskId);
    if (!originalTask) return;
    const originalStatus = originalTask.status;

    // 2. Optimistic Update: Instantly change the local state
    const optimisticTasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    
    // Mutate SWR cache immediately (false = don't revalidate from server right now)
    mutate(optimisticTasks, false);

    // 3. Send the real PUT request to the backend
    try {
      // Triggers the Backend Route: PUT /api/tasks/:id/status
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      
      // Optionally re-sync with server after successful put
      mutate();
    } catch (error) {
      console.error("Failed to update status", error);
      
      // 4. On Failure: Revert UI back to the original state
      const revertedTasks = tasks.map(t => t.id === taskId ? { ...t, status: originalStatus } : t);
      mutate(revertedTasks, false);
      
      // Display error toast to the user
      setErrorMsg("Failed to update task status. The card has been reverted to its original column.");
      
      // Auto-dismiss the toast after 5 seconds
      setTimeout(() => setErrorMsg(null), 5000);
    }
  };

  if (!user || user.role !== "team_member") {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => t.status === "pending");
  const inProgressTasks = tasks.filter(t => t.status === "in_progress");
  const completedTasks = tasks.filter(t => t.status === "completed");



  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 relative">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Task Board</h1>
        <p className="text-slate-500 mt-2 font-medium">Manage your assigned tasks and dynamically update their status.</p>
      </header>

      {/* Modern Floating Error Toast */}
      {errorMsg && (
        <div className="absolute top-0 right-0 z-50 bg-red-600 text-white px-6 py-4 rounded-xl shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300 flex items-center max-w-sm">
          <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <span className="font-semibold text-sm leading-tight">{errorMsg}</span>
        </div>
      )}

      {tasksError && (
         <div className="mb-6 bg-amber-50 text-amber-700 p-4 rounded-xl font-semibold border border-amber-200 shadow-sm flex items-center">
           <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
           Note: Showing mocked offline data. Ensure your Backend API is running.
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow pb-8">
        <KanbanColumn title="Pending" count={pendingTasks.length} headerColor="bg-amber-100" items={pendingTasks} isLoading={isLoading} onStatusChange={handleStatusChange} />
        <KanbanColumn title="In Progress" count={inProgressTasks.length} headerColor="bg-blue-100" items={inProgressTasks} isLoading={isLoading} onStatusChange={handleStatusChange} />
        <KanbanColumn title="Completed" count={completedTasks.length} headerColor="bg-emerald-100" items={completedTasks} isLoading={isLoading} onStatusChange={handleStatusChange} />
      </div>
    </div>
  );
}
