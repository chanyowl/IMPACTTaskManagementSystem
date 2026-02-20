/**
 * Task Management Board
 *
 * Kanban-style board with three columns: Pending | Active | Done
 * Supports drag-and-drop task movement
 */

import React, { useState } from 'react';
import { useTaskManagement } from '../context/TaskManagementContext';
import TaskManagementCard from './TaskManagementCard';
import TaskManagementForm from './TaskManagementForm';
import TrashBinPanel from './TrashBinPanel';

export default function TaskManagementBoard() {
  const { tasks, loading, error, moveTaskToStatus, refreshTasks } = useTaskManagement();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('All Projects');

  const projects = [
    'All Projects',
    'IMPACT NXT',
    'STEP',
    'HEIRIT',
    'Lab-In-a-Box',
    'BlueNest'
  ];

  // Filter tasks based on selected project
  const filterTasks = (taskList: typeof tasks.pending) => {
    if (selectedProject === 'All Projects') return taskList;
    return taskList.filter(task => task.objective === selectedProject);
  };

  const filteredTasks = {
    pending: filterTasks(tasks.pending),
    active: filterTasks(tasks.active),
    done: filterTasks(tasks.done)
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (status: 'Pending' | 'Active' | 'Done') => {
    if (!draggedTaskId) return;

    // Find the task to check its current status
    const task = [...tasks.pending, ...tasks.active, ...tasks.done].find(
      t => t.taskId === draggedTaskId
    );

    // If task is already in this status, don't update
    if (task && task.status === status) {
      setDraggedTaskId(null);
      return;
    }

    try {
      await moveTaskToStatus(draggedTaskId, status, `Moved to ${status} via drag-and-drop`);
      setDraggedTaskId(null);
    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
        <button
          onClick={refreshTasks}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col p-6 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management System</h1>
          <p className="text-gray-600 mt-1">
            Manage tasks with full audit logging and ontology validation
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
          >
            {projects.map(project => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>
          <button
            onClick={() => setShowTaskForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-md flex items-center gap-2"
          >
            <span className="text-xl">+</span> New Task
          </button>
        </div>
      </div>



      {/* Kanban Board */}
      <div className="grid grid-cols-3 gap-6">
        {/* Pending Column */}
        <div
          className="bg-yellow-100 rounded-lg p-4 flex flex-col shadow-sm border border-yellow-200"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop('Pending')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">📋 Pending</h2>
            <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-sm font-medium">
              {filteredTasks.pending.length}
            </span>
          </div>
          <div className="space-y-3">
            {filteredTasks.pending.map((task) => (
              <TaskManagementCard
                key={task.taskId}
                task={task}
                onDragStart={() => handleDragStart(task.taskId)}
              />
            ))}
            {filteredTasks.pending.length === 0 && (
              <div className="text-center text-gray-400 mt-8">No pending tasks</div>
            )}
          </div>
        </div>

        {/* Active Column */}
        <div
          className="bg-blue-100 rounded-lg p-4 flex flex-col shadow-sm border border-blue-200"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop('Active')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">🚀 Active</h2>
            <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-sm font-medium">
              {filteredTasks.active.length}
            </span>
          </div>
          <div className="space-y-3">
            {filteredTasks.active.map((task) => (
              <TaskManagementCard
                key={task.taskId}
                task={task}
                onDragStart={() => handleDragStart(task.taskId)}
              />
            ))}
            {filteredTasks.active.length === 0 && (
              <div className="text-center text-gray-400 mt-8">No active tasks</div>
            )}
          </div>
        </div>

        {/* Done Column */}
        <div
          className="bg-green-100 rounded-lg p-4 flex flex-col shadow-sm border border-green-200"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop('Done')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">✅ Done</h2>
            <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-sm font-medium">
              {filteredTasks.done.length}
            </span>
          </div>
          <div className="space-y-3">
            {filteredTasks.done.map((task) => (
              <TaskManagementCard
                key={task.taskId}
                task={task}
                onDragStart={() => handleDragStart(task.taskId)}
              />
            ))}
            {filteredTasks.done.length === 0 && (
              <div className="text-center text-gray-400 mt-8">No completed tasks</div>
            )}
          </div>
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskManagementForm
          onClose={() => setShowTaskForm(false)}
          onSuccess={() => {
            setShowTaskForm(false);
            refreshTasks();
          }}
        />
      )}

      {/* Trash Bin Button (Floating Bottom Left) */}
      <button
        onClick={() => setShowTrash(true)}
        className="fixed bottom-6 left-6 p-4 bg-white text-gray-600 rounded-full shadow-lg hover:shadow-xl hover:text-red-500 hover:bg-red-50 transition-all border border-gray-200 z-40 group"
        title="Open Trash Bin"
      >
        <span className="text-2xl group-hover:scale-110 transition-transform block">🗑️</span>
      </button>

      {/* Trash Bin Panel */}
      <TrashBinPanel
        isOpen={showTrash}
        onClose={() => setShowTrash(false)}
        onTaskRestored={() => refreshTasks()}
      />
    </div>
  );
}
