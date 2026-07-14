"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Modal from "../../components/Modal";
import useSWR from "swr";
import api from "../../lib/axios";

// Types
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  manager_id: number;
}

// SWR Fetcher utilizing our configured Axios instance
const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "team_member" });
  const [newProject, setNewProject] = useState({ name: "", description: "", manager_id: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "projects">("users");

  // Auth check
  useEffect(() => {
    if (user === null && !localStorage.getItem("token")) {
      router.push("/login");
    } else if (user && user.role !== "admin") {
      router.push("/"); 
    }
  }, [user, router]);

  // Data Fetching using SWR
  // Note: /users endpoint needs to be implemented on the backend if it doesn't exist yet
  const { data: usersData, error: usersError, mutate: mutateUsers, isLoading: usersLoading } = useSWR(user?.role === "admin" ? "/users" : null, fetcher);
  const { data: projectsData, error: projectsError, isLoading: projectsLoading, mutate: mutateProjects } = useSWR(user?.role === "admin" ? "/projects" : null, fetcher);

  const users: User[] = Array.isArray(usersData) ? usersData : usersData?.users || [];
  const projects: Project[] = Array.isArray(projectsData) ? projectsData : projectsData?.projects || [];

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/auth/register", newUser);
      mutateUsers();
      setIsModalOpen(false);
      setNewUser({ name: "", email: "", password: "", role: "team_member" });
    } catch (error: any) {
       console.error("Failed to create user", error);
       alert(`Failed to create user: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/projects", newProject);
      mutateProjects();
      setIsProjectModalOpen(false);
      setNewProject({ name: "", description: "", manager_id: "" });
    } catch (error: any) {
      console.error("Failed to create project", error);
      alert(`Failed to create project: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await api.delete(`/users/${id}`);
      mutateUsers();
    } catch (error) {
      console.error("Failed to delete user", error);
      alert("Failed to delete user.");
    }
  };

  const handleChangeRole = async (id: number, newRole: string) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole.replace('_', ' ')}?`)) return;
    try {
      await api.put(`/users/${id}/role`, { role: newRole });
      mutateUsers();
    } catch (error) {
      console.error("Failed to change user role", error);
      alert("Failed to change role.");
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this project? All associated tasks will also be deleted.")) return;
    try {
      await api.delete(`/projects/${id}`);
      mutateProjects();
    } catch (error) {
      console.error("Failed to delete project", error);
      alert("Failed to delete project.");
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Skeletons for Loading State
  const renderTableSkeleton = () => (
    <div className="animate-pulse space-y-4 py-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex space-x-4 px-6">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="h-4 bg-slate-200 rounded w-1/6"></div>
        </div>
      ))}
    </div>
  );

  const renderGridSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse border border-slate-200 rounded-xl p-6 bg-white h-40">
          <div className="h-5 bg-slate-200 rounded w-2/3 mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-4/5"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-500 mt-2 text-sm md:text-base">Manage system users and oversee all ongoing projects globally.</p>
      </header>

      <div className="flex overflow-x-auto border-b border-slate-200 hide-scrollbar mb-6">
        <button
          onClick={() => setActiveTab("users")}
          className={`py-3 px-8 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "users" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          Manage Users
        </button>
        <button
          onClick={() => setActiveTab("projects")}
          className={`py-3 px-8 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "projects" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          All System Projects
        </button>
      </div>

      {/* Users Section */}
      {activeTab === "users" && (
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-slate-50/50 gap-4">
          <h2 className="text-xl font-bold text-slate-800">Manage Users</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all transform hover:-translate-y-0.5"
          >
            + Create New User
          </button>
        </div>
        
        {usersError && <div className="p-6 text-red-500 font-semibold bg-red-50">Error loading users. Ensure GET /api/users exists on backend.</div>}
        {usersLoading ? renderTableSkeleton() : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4 border-b border-slate-200">Name</th>
                  <th className="px-6 py-4 border-b border-slate-200">Email</th>
                  <th className="px-6 py-4 border-b border-slate-200">Role</th>
                  <th className="px-6 py-4 border-b border-slate-200 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{u.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select 
                        value={u.role} 
                        onChange={(e) => handleChangeRole(u.id, e.target.value)}
                        className={`text-xs font-bold rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                          u.role === 'project_manager' ? 'bg-blue-100 text-blue-700' : 
                          'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        <option value="team_member">Team Member</option>
                        <option value="project_manager">Project Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-xs font-bold text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
      )}

      {/* Projects Section */}
      {activeTab === "projects" && (
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-2">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-slate-50/50 gap-4">
          <h2 className="text-xl font-bold text-slate-800">All System Projects</h2>
          <button 
            onClick={() => setIsProjectModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all transform hover:-translate-y-0.5"
          >
            + Create New Project
          </button>
        </div>

        {projectsError && <div className="p-6 text-red-500 font-semibold bg-red-50">Error loading projects.</div>}
        {projectsLoading ? renderGridSkeleton() : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <div key={project.id} className="border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-white group flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{project.name}</h3>
                  <p className="text-slate-600 text-sm mb-6 line-clamp-3">{project.description}</p>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold pt-4 border-t border-slate-100">
                  <div className="flex gap-3">
                    <span className="text-slate-400">ID: #{project.id}</span>
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200">
                      Manager ID: {project.manager_id}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDeleteProject(project.id)}
                    className="text-red-600 hover:text-red-800 font-bold px-2 py-1 rounded hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 font-medium">No projects found.</div>
            )}
          </div>
        )}
      </section>
      )}

      {/* Create User Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New User">
        <form onSubmit={handleCreateUser} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
            <input 
              required
              type="text" 
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
            <input 
              required
              type="email" 
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <input 
              required
              type="password" 
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">System Role</label>
            <select 
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm cursor-pointer"
            >
              <option value="team_member">Team Member</option>
              <option value="project_manager">Project Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="pt-6 flex space-x-4">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all font-bold"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 font-bold"
            >
              {isSubmitting ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Project Modal */}
      <Modal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Project Name</label>
            <input 
              required
              type="text" 
              value={newProject.name}
              onChange={(e) => setNewProject({...newProject, name: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
              placeholder="E.g. Apollo Redesign"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
            <textarea 
              required
              value={newProject.description}
              onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm resize-none"
              placeholder="Project description and goals..."
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Assign Project Manager</label>
            <select 
              required
              value={newProject.manager_id}
              onChange={(e) => setNewProject({...newProject, manager_id: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm cursor-pointer"
            >
              <option value="" disabled>Select a PM...</option>
              {users.filter(u => u.role === 'project_manager').map(pm => (
                <option key={pm.id} value={pm.id.toString()}>{pm.name} ({pm.email})</option>
              ))}
            </select>
          </div>
          <div className="pt-6 flex space-x-4">
            <button 
              type="button"
              onClick={() => setIsProjectModalOpen(false)}
              className="flex-1 px-4 py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all font-bold"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 font-bold"
            >
              {isSubmitting ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
