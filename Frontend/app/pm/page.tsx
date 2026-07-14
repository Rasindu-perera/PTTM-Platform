"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Modal from "../../components/Modal";
import TaskCard, { Task } from "../../components/TaskCard";
import api from "../../lib/axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// 1. Define Zod Schema for robust validation
const taskSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().min(1, { message: "Description is required." }),
  project_id: z.string().min(1, { message: "Please select a project." }),
  status: z.enum(["pending", "in_progress", "completed"]),
  assigned_to_id: z.string().min(1, { message: "Please assign the task to a team member." }),
});

// Infer TypeScript types directly from the Zod schema
type TaskFormValues = z.infer<typeof taskSchema>;

// Mock Data Types
interface Project {
  id: number;
  name: string;
  description: string;
  team_members: string[]; 
}

export default function PMDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"projects" | "tasks">("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Initialize react-hook-form with zodResolver
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      project_id: "",
      status: "pending",
      assigned_to_id: "",
    },
  });

  // Auth Protection - strictly for 'project_manager'
  useEffect(() => {
    if (user === null && !localStorage.getItem("token")) {
      router.push("/login");
    } else if (user && user.role !== "project_manager") {
      router.push("/");
    }
  }, [user, router]);

  // Data Fetching (Mocked)
  useEffect(() => {
    if (!user || user.role !== "project_manager") return;

    setTimeout(() => {
      setProjects([
        { id: 1, name: "Alpha Release", description: "First major milestone for the product including core features.", team_members: ["Alice", "Bob"] },
        { id: 2, name: "Marketing Site", description: "Building the SEO optimized marketing site in Next.js.", team_members: ["Charlie", "Diana"] },
      ]);
      setTasks([
        { id: 101, project_id: 1, title: "Design DB Schema", description: "Map out the Postgres tables.", status: "completed", assigned_to_id: 3, assigned_to_name: "Alice" },
        { id: 102, project_id: 1, title: "Create API Routes", description: "Express routes for tasks.", status: "in_progress", assigned_to_id: 4, assigned_to_name: "Bob" },
        { id: 103, project_id: 2, title: "Figma Mockups", description: "Design the landing page.", status: "pending", assigned_to_id: 5, assigned_to_name: "Charlie" },
      ]);
      setIsLoading(false);
    }, 600);
  }, [user]);

  // 3. Form Submit Handler (Only runs if validation passes)
  const onSubmit = async (data: TaskFormValues) => {
    setIsSubmitting(true);
    
    try {
      // --- REAL API CALL via Axios ---
      // const response = await api.post("/tasks", data);
      // const createdTask = response.data.task;
      
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 800));

      const assignedUserNames: Record<string, string> = { "3": "Alice", "4": "Bob", "5": "Charlie" };
      const createdTask: Task = {
        id: Math.floor(Math.random() * 1000) + 200,
        project_id: Number(data.project_id),
        title: data.title,
        description: data.description,
        status: data.status,
        assigned_to_id: Number(data.assigned_to_id),
        assigned_to_name: assignedUserNames[data.assigned_to_id] || "Unknown",
      };

      setTasks([createdTask, ...tasks]);
      closeModal();
    } catch (error) {
      console.error("Failed to create task", error);
      // In a real app, display a toast or error alert here
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsTaskModalOpen(false);
    reset(); // Reset form errors and values when closing
  };

  if (!user || user.role !== "project_manager" || isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Project Manager Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your projects and coordinate team tasks.</p>
        </div>
        <button 
          onClick={() => setIsTaskModalOpen(true)}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-md transition-all hover:shadow-lg transform hover:-translate-y-0.5"
        >
          + Create Task
        </button>
      </header>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto border-b border-slate-200 hide-scrollbar">
        <button
          onClick={() => setActiveTab("projects")}
          className={`py-3 px-8 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "projects" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          My Projects
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          className={`py-3 px-8 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "tasks" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          Project Tasks
        </button>
      </div>

      {/* Projects View */}
      {activeTab === "projects" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {projects.map(project => (
            <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col hover:border-indigo-300 transition-colors duration-300 group">
              <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{project.name}</h3>
              <p className="text-slate-600 text-sm mb-6 flex-grow leading-relaxed">{project.description}</p>
              
              <div className="pt-5 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Team Members</p>
                <div className="flex flex-wrap gap-2">
                  {project.team_members.map((member, idx) => (
                    <span key={idx} className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {member}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
             <p className="text-slate-400 col-span-full py-12 text-center font-medium">No projects found.</p>
          )}
        </div>
      )}

      {/* Tasks View */}
      {activeTab === "tasks" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
          {tasks.length === 0 && (
             <p className="text-slate-400 col-span-full py-12 text-center font-medium">No tasks found.</p>
          )}
        </div>
      )}

      {/* Create Task Modal with Zod + React Hook Form */}
      <Modal isOpen={isTaskModalOpen} onClose={closeModal} title="Create New Task">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Task Title</label>
            <input 
              {...register("title")}
              type="text" 
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow bg-slate-50 focus:bg-white ${
                errors.title ? "border-red-500 ring-1 ring-red-500" : "border-slate-300"
              }`}
              placeholder="E.g., Implement authentication"
            />
            {errors.title && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
            <textarea 
              {...register("description")}
              rows={3}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow resize-none bg-slate-50 focus:bg-white ${
                errors.description ? "border-red-500 ring-1 ring-red-500" : "border-slate-300"
              }`}
              placeholder="Detailed task instructions..."
            />
            {errors.description && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.description.message}</p>}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Project</label>
              <select 
                {...register("project_id")}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white cursor-pointer ${
                  errors.project_id ? "border-red-500 ring-1 ring-red-500" : "border-slate-300"
                }`}
              >
                <option value="" disabled>Select Project...</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {errors.project_id && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.project_id.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
              <select 
                {...register("status")}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white cursor-pointer ${
                  errors.status ? "border-red-500 ring-1 ring-red-500" : "border-slate-300"
                }`}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              {errors.status && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.status.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Assign To</label>
            <select 
              {...register("assigned_to_id")}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white cursor-pointer ${
                errors.assigned_to_id ? "border-red-500 ring-1 ring-red-500" : "border-slate-300"
              }`}
            >
              <option value="" disabled>Select Team Member...</option>
              <option value="3">Alice</option>
              <option value="4">Bob</option>
              <option value="5">Charlie</option>
            </select>
            {errors.assigned_to_id && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.assigned_to_id.message}</p>}
          </div>

          <div className="pt-5 flex flex-col-reverse sm:flex-row gap-3">
            <button 
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              className="w-full sm:flex-1 px-4 py-2.5 border-2 border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all font-bold"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md transform hover:-translate-y-0.5 font-bold flex justify-center items-center ${
                isSubmitting ? "opacity-70 cursor-wait" : ""
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Task"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
