"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import TaskCard, { Task } from "../../components/TaskCard";

export default function MemberDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auth Protection - strictly for 'team_member'
  useEffect(() => {
    if (user === null && !localStorage.getItem("token")) {
      router.push("/login");
    } else if (user && user.role !== "team_member") {
      router.push("/");
    }
  }, [user, router]);

  // Data Fetching (Mocked)
  useEffect(() => {
    if (!user || user.role !== "team_member") return;

    // Simulate API Call for fetching assigned tasks
    // E.g., fetch(`http://localhost:5000/api/tasks/assigned/${user.id}`)
    setTimeout(() => {
      setTasks([
        { id: 201, project_id: 1, title: "Setup Local Environment", description: "Install Node.js, clone the repository, and run npm install.", status: "completed", assigned_to_id: user.id, assigned_to_name: user.name },
        { id: 202, project_id: 1, title: "Implement Kanban UI", description: "Design a 3-column responsive flexbox layout in Tailwind.", status: "in_progress", assigned_to_id: user.id, assigned_to_name: user.name },
        { id: 203, project_id: 2, title: "Write Unit Tests", description: "Ensure the AuthContext works correctly with mock localStorage.", status: "pending", assigned_to_id: user.id, assigned_to_name: user.name },
        { id: 204, project_id: 2, title: "Fix CSS Bug in Modal", description: "The modal backdrop z-index overlaps the navbar. Fix requested by QA.", status: "pending", assigned_to_id: user.id, assigned_to_name: user.name },
      ]);
      setIsLoading(false);
    }, 600);
  }, [user]);

  const handleStatusChange = (taskId: number, newStatus: 'pending' | 'in_progress' | 'completed') => {
    // Optimistic UI update: instantly move the card to the new column
    setTasks(prevTasks => 
      prevTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
    );
    
    // --- REAL API CALL (Commented out) ---
    /*
    fetch(`http://localhost:5000/api/tasks/${taskId}/status`, { 
      method: 'PUT', 
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status: newStatus }) 
    }).catch(error => {
      console.error("Failed to update status", error);
      // Revert optimistic update here if needed
    });
    */
  };

  // Render loading spinner
  if (!user || user.role !== "team_member" || isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Filter tasks into columns
  const pendingTasks = tasks.filter(t => t.status === "pending");
  const inProgressTasks = tasks.filter(t => t.status === "in_progress");
  const completedTasks = tasks.filter(t => t.status === "completed");

  // Reusable Kanban Column Sub-component
  const KanbanColumn = ({ title, count, headerColor, items }: { title: string, count: number, headerColor: string, items: Task[] }) => (
    <div className="flex flex-col bg-slate-100/50 rounded-2xl border border-slate-200 overflow-hidden h-[70vh] min-h-[500px]">
      <div className={`px-5 py-4 border-b border-slate-200 flex justify-between items-center ${headerColor}`}>
        <h2 className="font-extrabold text-slate-800 tracking-tight">{title}</h2>
        <span className="bg-white text-slate-700 text-xs font-extrabold px-3 py-1 rounded-full shadow-sm">{count}</span>
      </div>
      
      {/* Scrollable Column Body */}
      <div className="p-4 flex-grow flex flex-col gap-4 overflow-y-auto hide-scrollbar">
        {items.map(task => (
          <div key={task.id} className="transform transition-all duration-300 hover:-translate-y-1">
            <TaskCard task={task} onStatusChange={handleStatusChange} />
          </div>
        ))}
        
        {items.length === 0 && (
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

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Task Board</h1>
        <p className="text-slate-500 mt-2 font-medium">Manage your assigned tasks and dynamically update their status.</p>
      </header>

      {/* Kanban Board Layout using CSS Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow pb-8">
        <KanbanColumn 
          title="Pending" 
          count={pendingTasks.length} 
          headerColor="bg-amber-100" 
          items={pendingTasks} 
        />
        <KanbanColumn 
          title="In Progress" 
          count={inProgressTasks.length} 
          headerColor="bg-blue-100" 
          items={inProgressTasks} 
        />
        <KanbanColumn 
          title="Completed" 
          count={completedTasks.length} 
          headerColor="bg-emerald-100" 
          items={completedTasks} 
        />
      </div>
    </div>
  );
}
