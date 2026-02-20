import React, { useState, useEffect } from 'react';
import type { TaskManagement } from '../services/taskManagementApi';
import { getDeletedTasks, restoreTask, permanentlyDeleteTask } from '../services/taskManagementApi';

interface TrashBinPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onTaskRestored: () => void;
}

export default function TrashBinPanel({ isOpen, onClose, onTaskRestored }: TrashBinPanelProps) {
    const [deletedTasks, setDeletedTasks] = useState<TaskManagement[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchDeletedTasks();
            setSelectedTasks(new Set());
        }
    }, [isOpen]);

    const fetchDeletedTasks = async () => {
        setLoading(true);
        setError(null);
        try {
            const tasks = await getDeletedTasks();
            setDeletedTasks(tasks);
        } catch (err: any) {
            setError(err.message || 'Failed to load trash');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedTasks(new Set(deletedTasks.map(t => t.taskId)));
        } else {
            setSelectedTasks(new Set());
        }
    };

    const handleSelectTask = (taskId: string) => {
        const newSelected = new Set(selectedTasks);
        if (newSelected.has(taskId)) {
            newSelected.delete(taskId);
        } else {
            newSelected.add(taskId);
        }
        setSelectedTasks(newSelected);
    };

    const handleRestore = async () => {
        if (selectedTasks.size === 0) return;

        setLoading(true);
        try {
            await Promise.all(Array.from(selectedTasks).map(id => restoreTask(id)));
            await fetchDeletedTasks();
            onTaskRestored();
            setSelectedTasks(new Set());
        } catch (err: any) {
            setError(err.message || 'Failed to restore tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteForever = async () => {
        if (selectedTasks.size === 0) return;
        if (!window.confirm(`Are you sure you want to permanently delete ${selectedTasks.size} tasks? This cannot be undone.`)) return;

        setLoading(true);
        try {
            await Promise.all(Array.from(selectedTasks).map(id => permanentlyDeleteTask(id)));
            await fetchDeletedTasks();
            setSelectedTasks(new Set());
        } catch (err: any) {
            setError(err.message || 'Failed to delete tasks');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🗑️</span>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Trash Bin</h2>
                            <p className="text-sm text-gray-500">Manage deleted tasks</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={deletedTasks.length > 0 && selectedTasks.size === deletedTasks.length}
                            onChange={handleSelectAll}
                            disabled={deletedTasks.length === 0}
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">
                            {selectedTasks.size} selected
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleRestore}
                            disabled={selectedTasks.size === 0 || loading}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedTasks.size > 0
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            Restore Selected
                        </button>
                        <button
                            onClick={handleDeleteForever}
                            disabled={selectedTasks.size === 0 || loading}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedTasks.size > 0
                                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            Delete Forever
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {loading && deletedTasks.length === 0 ? (
                        <div className="flex justify-center items-center h-full text-gray-500">
                            Loading...
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-600 p-4">{error}</div>
                    ) : deletedTasks.length === 0 ? (
                        <div className="text-center text-gray-500 py-12 flex flex-col items-center">
                            <span className="text-4xl mb-3">🧹</span>
                            <p className="text-lg">Trash is empty</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {deletedTasks.map(task => (
                                <div
                                    key={task.taskId}
                                    className={`bg-white p-4 rounded-lg border transition-all ${selectedTasks.has(task.taskId)
                                        ? 'border-blue-500 shadow-md ring-1 ring-blue-500'
                                        : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                        }`}
                                    onClick={() => handleSelectTask(task.taskId)}
                                >
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedTasks.has(task.taskId)}
                                            onChange={() => handleSelectTask(task.taskId)}
                                            className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-semibold text-gray-900">{task.deliverable}</h3>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase
                          ${task.status === 'Done' ? 'bg-green-100 text-green-800' :
                                                        task.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-yellow-100 text-yellow-800'}`
                                                }>
                                                    {task.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1 line-clamp-1">{task.intent || 'No description'}</p>
                                            <div className="flex gap-4 mt-2 text-xs text-gray-400">
                                                <span>Assignee: {task.assignee}</span>
                                                <span>Deleted: {task.updatedAt && task.updatedAt._seconds ? new Date(task.updatedAt._seconds * 1000).toLocaleDateString() : 'Unknown'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
