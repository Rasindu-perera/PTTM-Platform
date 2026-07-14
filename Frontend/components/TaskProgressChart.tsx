"use client";

import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

// Define the expected task shape
interface Task {
  status: "pending" | "in_progress" | "completed";
}

interface TaskProgressChartProps {
  tasks: Task[];
}

export default function TaskProgressChart({ tasks }: TaskProgressChartProps) {
  // 1. Calculate the metrics
  const pendingCount = tasks.filter(task => task.status === "pending").length;
  const inProgressCount = tasks.filter(task => task.status === "in_progress").length;
  const completedCount = tasks.filter(task => task.status === "completed").length;

  // 2. Configure the Chart.js data
  const data = {
    labels: ["Pending", "In Progress", "Completed"],
    datasets: [
      {
        data: [pendingCount, inProgressCount, completedCount],
        backgroundColor: [
          "#fbbf24", // amber-400
          "#60a5fa", // blue-400
          "#34d399", // emerald-400
        ],
        hoverBackgroundColor: [
          "#f59e0b", // amber-500
          "#3b82f6", // blue-500
          "#10b981", // emerald-500
        ],
        borderColor: "#ffffff",
        borderWidth: 3,
        cutout: "75%", // Gives it the modern ring/doughnut look
      },
    ],
  };

  // 3. Configure the Chart.js options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: "'Inter', sans-serif",
            size: 13,
            weight: 600 as const,
          },
          color: "#475569", // slate-600
        },
      },
      tooltip: {
        backgroundColor: "#1e293b", // slate-800
        titleFont: { family: "'Inter', sans-serif", size: 13 },
        bodyFont: { family: "'Inter', sans-serif", size: 14, weight: 600 as const },
        padding: 12,
        cornerRadius: 8,
        boxPadding: 6,
      },
    },
  };

  // Render an empty state if no tasks exist
  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center h-full min-h-[300px]">
        <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-slate-500 font-medium">No tasks available to track.</p>
      </div>
    );
  }

  // Render the Doughnut chart
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center w-full h-full min-h-[350px]">
      <h3 className="text-lg font-extrabold text-slate-800 w-full text-left mb-6">Task Progress</h3>
      
      <div className="relative w-full flex-grow flex justify-center items-center">
        <Doughnut data={data} options={options} />
        
        {/* Absolute Centered Total Number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-8">
          <span className="text-4xl font-black text-slate-800 tracking-tight">{tasks.length}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total</span>
        </div>
      </div>
    </div>
  );
}
