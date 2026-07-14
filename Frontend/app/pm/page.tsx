"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Modal from "../../components/Modal";
import TaskCard, { Task } from "../../components/TaskCard";
import TaskProgressChart from "../../components/TaskProgressChart";
import api from "../../lib/axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import useSWR from "swr";

const taskSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().min(1, { message: "Description is required." }),
  project_id: z.string().min(1, { message: "Please select a project." }),
  status: z.enum(["pending", "in_progress", "completed"]),
  assigned_to_id: z.string().min(1, { message: "Please assign the task to a team member." }),
});

const projectSchema = z.object({
  name: z.string().min(3, { message: "Project name must be at least 3 characters." }),
  description: z.string().min(1, { message: "Description is required." }),
});

type TaskFormValues = z.infer<typeof taskSchema>;
type ProjectFormValues = z.infer<typeof projectSchema>;

interface Project {
  id: number;
  name: string;
  description: string;
  // We make team_members optional since the backend might not return it immediately
  team_members?: string[]; 
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function PMDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"projects" | "tasks">("projects");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: "", description: "", project_id: "", status: "pending", assigned_to_id: "" },
  });

  const { register: registerProject, handleSubmit: handleProjectSubmit, reset: resetProject, formState: { errors: projectErrors } } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    if (user === null && !localStorage.getItem("token")) {
      router.push("/login");
    } else if (user && user.role !== "project_manager") {
      router.push("/");
    }
  }, [user, router]);

  // Data Fetching using SWR
  const { data: projectsData, error: projectsError, isLoading: projectsLoading, mutate: mutateProjects } = useSWR(user?.role === "project_manager" ? "/projects" : null, fetcher);
  const { data: tasksData, error: tasksError, mutate: mutateTasks, isLoading: tasksLoading } = useSWR(user?.role === "project_manager" ? "/tasks" : null, fetcher);
  const { data: usersData } = useSWR(user?.role === "project_manager" ? "/users" : null, fetcher);

  const projects: Project[] = Array.isArray(projectsData) ? projectsData : projectsData?.projects || [];
  const tasks: Task[] = Array.isArray(tasksData) ? tasksData : tasksData?.tasks || [];
  const users: User[] = Array.isArray(usersData) ? usersData : usersData?.users || [];

  const onSubmit = async (data: TaskFormValues) => {
    setIsSubmitting(true);
    try {
      await api.post("/tasks", data);
      mutateTasks(); // Refetch tasks automatically
      closeModal();
    } catch (error: any) {
      console.error("Failed to create task", error);
      alert(`Failed to create task: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onProjectSubmit = async (data: ProjectFormValues) => {
    setIsSubmitting(true);
    try {
      await api.post("/projects", data);
      mutateProjects(); // Refetch projects automatically
      closeProjectModal();
    } catch (error: any) {
      console.error("Failed to create project", error);
      alert(`Failed to create project: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsTaskModalOpen(false);
    reset(); 
  };

  const closeProjectModal = () => {
    setIsProjectModalOpen(false);
    resetProject(); 
  };

  if (!user || user.role !== "project_manager") {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Skeleton Loaders
  const renderCardSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse bg-white border border-slate-200 rounded-xl p-5 h-48">
          <div className="h-5 bg-slate-200 rounded w-2/3 mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-4/5 mb-8"></div>
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Project Manager Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your projects and coordinate team tasks.</p>
        </div>
        {activeTab === "projects" ? (
          <button 
            onClick={() => setIsProjectModalOpen(true)}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-md transition-all hover:shadow-lg transform hover:-translate-y-0.5"
          >
            + Create Project
          </button>
        ) : (
          <button 
            onClick={() => setIsTaskModalOpen(true)}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-md transition-all hover:shadow-lg transform hover:-translate-y-0.5"
          >
            + Create Task
          </button>
        )}
      </header>

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

      {activeTab === "projects" && (
        <div className="pt-4">
          {projectsError && <p className="text-red-500 bg-red-50 p-4 rounded-md">Error loading projects.</p>}
          {projectsLoading ? renderCardSkeleton() : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {projects.map(project => (
                <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col hover:border-indigo-300 transition-colors duration-300 group">
                  <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{project.name}</h3>
                  <p className="text-slate-600 text-sm mb-6 flex-grow leading-relaxed">{project.description}</p>
                </div>
              ))}
              {projects.length === 0 && <p className="text-slate-400 col-span-full py-12 text-center font-medium">No projects found.</p>}
            </div>
          )}
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="pt-4 space-y-8">
          {tasksError && <p className="text-red-500 bg-red-50 p-4 rounded-md">Error loading tasks. Ensure GET /api/tasks exists on backend.</p>}
          
          {/* Chart Section */}
          {!tasksError && !tasksLoading && tasks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="md:col-span-1">
                <TaskProgressChart tasks={tasks} />
              </div>
              <div className="md:col-span-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-sm border border-indigo-400 p-8 flex flex-col justify-center text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-3xl font-black mb-2">You're doing great!</h2>
                  <p className="text-indigo-100 font-medium max-w-md leading-relaxed">
                    Keep track of your team's velocity. Currently, {tasks.filter(t => t.status === 'completed').length} out of {tasks.length} tasks are fully completed.
                  </p>
                </div>
                {/* Decorative background circle */}
                <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white opacity-10 rounded-full blur-2xl"></div>
              </div>
            </div>
          )}

          {/* Tasks Grid */}
          {tasksLoading ? renderCardSkeleton() : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {tasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
              {tasks.length === 0 && <p className="text-slate-400 col-span-full py-12 text-center font-medium">No tasks found.</p>}
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isTaskModalOpen} onClose={closeModal} title="Create New Task">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Task Title</label>
            <input 
              {...register("title")}
              type="text" 
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 ${
                errors.title ? "border-red-500 ring-1 ring-red-500" : "border-slate-300"
              }`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1.5">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
            <textarea 
              {...register("description")}
              rows={3}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-slate-50 ${
                errors.description ? "border-red-500 ring-1 ring-red-500" : "border-slate-300"
              }`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1.5">{errors.description.message}</p>}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Project</label>
              <select 
                {...register("project_id")}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 ${
                  errors.project_id ? "border-red-500 ring-1 ring-red-500" : "border-slate-300"
                }`}
              >
                <option value="" disabled>Select Project...</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id.toString()}>{p.name}</option>
                ))}
              </select>
              {errors.project_id && <p className="text-red-500 text-xs mt-1.5">{errors.project_id.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
              <select 
                {...register("status")}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Assign To</label>
            <select 
              {...register("assigned_to_id")}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 ${
                errors.assigned_to_id ? "border-red-500 ring-1 ring-red-500" : "border-slate-300"
              }`}
            >
              <option value="" disabled>Select User...</option>
              {users.map(u => (
                <option key={u.id} value={u.id.toString()}>{u.name} ({u.role.replace('_', ' ')})</option>
              ))}
            </select>
            {errors.assigned_to_id && <p className="text-red-500 text-xs mt-1.5">{errors.assigned_to_id.message}</p>}
          </div>

          <div className="pt-5 flex flex-col-reverse sm:flex-row gap-3">
            <button 
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              className="w-full sm:flex-1 px-4 py-2.5 border-2 border-slate-200 text-slate-700 rounded-lg font-bold"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold"
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Project Modal */}
      <Modal isOpen={isProjectModalOpen} onClose={closeProjectModal} title="Create New Project">
        <form onSubmit={handleProjectSubmit(onProjectSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Project Name</label>
            <input 
              {...registerProject("name")}
              type="text" 
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 ${
                projectErrors.name ? "border-red-500 ring-1 ring-red-500" : "border-slate-300"
              }`}
            />
            {projectErrors.name && <p className="text-red-500 text-xs mt-1.5">{projectErrors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
            <textarea 
              {...registerProject("description")}
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-slate-50 ${
                projectErrors.description ? "border-red-500 ring-1 ring-red-500" : "border-slate-300"
              }`}
            />
            {projectErrors.description && <p className="text-red-500 text-xs mt-1.5">{projectErrors.description.message}</p>}
          </div>

          <div className="pt-5 flex flex-col-reverse sm:flex-row gap-3">
            <button 
              type="button"
              onClick={closeProjectModal}
              disabled={isSubmitting}
              className="w-full sm:flex-1 px-4 py-2.5 border-2 border-slate-200 text-slate-700 rounded-lg font-bold"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold"
            >
              {isSubmitting ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
