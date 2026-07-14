"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Modal from "../../components/Modal";

// Types for our mocked data structure
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

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();

  // State setup structured for real API integration
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New User Form State
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "team_member" });

  // Authorization Check - Ensure only 'admin' can view this page
  useEffect(() => {
    // If not authenticated (and no token in storage), redirect to login
    if (user === null && !localStorage.getItem("token")) {
      router.push("/login");
    } 
    // If authenticated but not an admin, redirect to home
    else if (user && user.role !== "admin") {
      router.push("/"); 
    }
  }, [user, router]);

  // Data Fetching 
  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // --- REAL API STRUCTURE (Commented out) ---
        /*
        const [usersRes, projectsRes] = await Promise.all([
          fetch("http://localhost:5000/api/users", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5000/api/projects", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        const usersData = await usersRes.json();
        const projectsData = await projectsRes.json();
        
        setUsers(usersData.users || usersData);
        setProjects(projectsData.projects || projectsData);
        */

        // --- MOCKED API RESPONSE ---
        setTimeout(() => {
          setUsers([
            { id: 1, name: "Adminstrator", email: "admin@example.com", role: "admin" },
            { id: 2, name: "Alice Manager", email: "alice@example.com", role: "project_manager" },
            { id: 3, name: "Bob Worker", email: "bob@example.com", role: "team_member" },
          ]);
          setProjects([
            { id: 101, name: "Platform Rewrite", description: "Rewriting the legacy platform to Next.js and Tailwind.", manager_id: 2 },
            { id: 102, name: "Database Migration", description: "Migrate from MySQL to PostgreSQL gracefully.", manager_id: 2 },
          ]);
          setIsLoading(false);
        }, 800); // Simulate network latency

      } catch (error) {
        console.error("Failed to fetch admin data", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, token]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // --- REAL API CALL (Commented out) ---
    /*
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newUser)
      });
      const data = await response.json();
      if(response.ok) {
        setUsers([...users, data.user]);
      }
    } catch (error) {
       console.error(error);
    }
    */

    // MOCK update
    const createdUser: User = {
      id: Math.floor(Math.random() * 1000) + 4,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    };
    
    setUsers([...users, createdUser]);
    setIsModalOpen(false);
    setNewUser({ name: "", email: "", password: "", role: "team_member" });
  };

  // Render loading state while validating auth or fetching data
  if (!user || user.role !== "admin" || isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-500 mt-2 text-sm md:text-base">Manage system users and oversee all ongoing projects globally.</p>
      </header>

      {/* --- Users Management Section --- */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-slate-50/50 gap-4">
          <h2 className="text-xl font-bold text-slate-800">Manage Users</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all duration-200 transform hover:-translate-y-0.5"
          >
            + Create New User
          </button>
        </div>
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
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize
                      ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 
                        u.role === 'project_manager' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 
                        'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                      {u.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                     <button className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors">Edit</button>
                     <button className="text-red-600 hover:text-red-900 transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No users found in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- Projects Section --- */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">All System Projects</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.id} className="border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-white group flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{project.name}</h3>
                <p className="text-slate-600 text-sm mb-6 line-clamp-3">{project.description}</p>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold pt-4 border-t border-slate-100">
                <span className="text-slate-400">ID: #{project.id}</span>
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200">
                  Manager ID: {project.manager_id}
                </span>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 font-medium">
              No projects found in the system.
            </div>
          )}
        </div>
      </section>

      {/* --- Create User Modal --- */}
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
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 font-bold"
            >
              Create User
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
