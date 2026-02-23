/**
 * Task Management Details
 *
 * Full task details view with audit history
 */

import React, { useState, useEffect } from 'react';
import { getTask, getTaskAudit, updateTask } from '../services/taskManagementApi';
import type { TaskManagement, AuditLog } from '../services/taskManagementApi';
import type { SOP } from '../services/sopApi';
import { getSOP } from '../services/sopApi';

import { useTaskManagement } from '../context/TaskManagementContext';

interface TaskManagementDetailsProps {
  taskId: string;
  onClose: () => void;
  onTaskUpdate?: () => void;
}

export default function TaskManagementDetails({ taskId, onClose, onTaskUpdate }: TaskManagementDetailsProps) {
  const { objectives } = useTaskManagement();
  const [task, setTask] = useState<TaskManagement | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [relatedSOPs, setRelatedSOPs] = useState<SOP[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(true);


  // Editing state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Status update state
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [newStatus, setNewStatus] = useState<'Pending' | 'Active' | 'Done'>('Pending');
  const [updateComment, setUpdateComment] = useState('');

  // Get objective title from ID
  const getObjectiveTitle = (objectiveId: string): string => {
    const objective = objectives.find(obj => obj.objectiveId === objectiveId);
    return objective ? objective.title : objectiveId;
  };

  const startEditing = (field: string, value: any) => {
    setEditingField(field);

    // Format date for input if needed
    if ((field === 'startDate' || field === 'dueDate') && value) {
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        setEditValue(value);
      } else {
        try {
          const d = new Date(value._seconds ? value._seconds * 1000 : value);
          if (!isNaN(d.getTime())) {
            setEditValue(d.toISOString().split('T')[0]);
          } else {
            setEditValue('');
          }
        } catch {
          setEditValue('');
        }
      }
    } else {
      setEditValue(value);
    }
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValue(null);
  };

  const saveEdit = async () => {
    if (!task || !editingField) return;

    // Check if value actually changed
    const currentValue = task[editingField as keyof TaskManagement];

    // Handle array comparison (e.g., tags, evidence)
    if (Array.isArray(currentValue) && Array.isArray(editValue)) {
      if (JSON.stringify(currentValue) === JSON.stringify(editValue)) {
        cancelEditing();
        return;
      }
    }
    // Handle date comparison
    else if ((editingField === 'startDate' || editingField === 'dueDate') && currentValue) {
      // Current value might be a Firestore timestamp or ISO string
      let currentIso = '';
      if (typeof currentValue === 'object' && '_seconds' in currentValue) {
        currentIso = new Date((currentValue as any)._seconds * 1000).toISOString().split('T')[0];
      } else if (typeof currentValue === 'string') {
        currentIso = currentValue.split('T')[0];
      }

      if (currentIso === editValue) {
        cancelEditing();
        return;
      }
    }
    // Handle primitive comparison
    else if (currentValue === editValue) {
      cancelEditing();
      return;
    }

    try {
      setIsSaving(true);
      const updates = { [editingField]: editValue };

      await updateTask(task.taskId, updates);

      // Update local state
      setTask(prev => prev ? { ...prev, ...updates } : null);
      setEditingField(null);
      setEditValue(null);

      // Refresh audit logs
      const audit = await getTaskAudit(task.taskId);
      setAuditLogs(audit);

      // Notify parent of update
      if (onTaskUpdate) {
        onTaskUpdate();
      }

    } catch (error: any) {
      console.error('Error updating task:', error);
      alert(error.message || 'Failed to update task');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!task) return;

    try {
      setIsSaving(true);

      await updateTask(task.taskId, {
        status: newStatus,
        reason: updateComment
      });

      // Update local state
      setTask(prev => prev ? { ...prev, status: newStatus } : null);
      setShowStatusUpdate(false);
      setUpdateComment('');

      // Refresh audit logs
      const audit = await getTaskAudit(task.taskId);
      setAuditLogs(audit);

      // Notify parent of update
      if (onTaskUpdate) {
        onTaskUpdate();
      }

    } catch (error: any) {
      console.error('Error updating status:', error);
      alert(error.message || 'Failed to update status');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  useEffect(() => {
    loadTaskDetails();
  }, [taskId]);

  const loadTaskDetails = async () => {
    try {
      setLoading(true);
      const [taskData, audit] = await Promise.all([
        getTask(taskId),
        getTaskAudit(taskId)
      ]);
      setTask(taskData);
      setAuditLogs(audit);

      // Load related SOPs if any
      if (taskData.relatedSOPs && taskData.relatedSOPs.length > 0) {
        const sops = await Promise.all(
          taskData.relatedSOPs.map(sopId => getSOP(sopId).catch(() => null))
        );
        setRelatedSOPs(sops.filter((sop): sop is SOP => sop !== null));
      }
    } catch (error) {
      console.error('Error loading task details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: any) => {
    try {
      if (!date) return 'Not set';

      let d: Date;

      // Handle Firestore Timestamp object with _seconds property
      if (date._seconds !== undefined) {
        d = new Date(date._seconds * 1000);
      }
      // Handle Firestore Timestamp with seconds property
      else if (date.seconds !== undefined) {
        d = new Date(date.seconds * 1000);
      }
      // Handle ISO string (e.g., "2024-02-06") or date string
      else if (typeof date === 'string') {
        d = new Date(date);
      }
      // Handle Date object
      else if (date instanceof Date) {
        d = date;
      }
      // Unknown format
      else {
        console.warn('Unknown date format:', date);
        return JSON.stringify(date);
      }

      // Check if date is valid
      if (isNaN(d.getTime())) {
        console.warn('Invalid date:', date);
        return JSON.stringify(date);
      }

      // For date-only strings (YYYY-MM-DD), show date without time
      if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }

      // For timestamps, show date and time
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return JSON.stringify(date);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-lg">Loading task details...</div>
        </div>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Task Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div>
            <span
              className={`px-4 py-2 rounded-full font-semibold ${task.status === 'Done'
                ? 'bg-green-100 text-green-800'
                : task.status === 'Active'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
                }`}
            >
              {task.status}
            </span>

            <button
              onClick={() => {
                setNewStatus(task.status);
                setUpdateComment('');
                setShowStatusUpdate(true);
              }}
              className="ml-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full text-xs font-bold transition-colors"
              title="Update status with comment"
            >
              +
            </button>

            {showStatusUpdate && (
              <div className="absolute mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-xl z-10 w-80">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Update Status</h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">New Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Active">Active</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Comment / Reason</label>
                    <textarea
                      value={updateComment}
                      onChange={(e) => setUpdateComment(e.target.value)}
                      placeholder="Why is this status changing?"
                      className="w-full p-2 border rounded text-sm min-h-[80px]"
                      autoFocus
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setShowStatusUpdate(false)}
                      className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded"
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleStatusUpdate}
                      className="px-3 py-1.5 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded"
                      disabled={isSaving}
                    >
                      {isSaving ? 'Updating...' : 'Update Status'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <span className="ml-4 text-sm text-gray-500">Version {task.version}</span>
          </div>

          {/* Deliverable - MOVED TO TOP */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Deliverable</h3>
            {editingField === 'deliverable' ? (
              <textarea
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={saveEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    saveEdit();
                  } else if (e.key === 'Escape') {
                    cancelEditing();
                  }
                }}
                className="w-full p-2 border rounded-lg min-h-[100px] disabled:bg-gray-100"
                disabled={isSaving}
              />
            ) : (
              <p
                className="text-gray-900 bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 border border-transparent hover:border-gray-300 transition-colors"
                onDoubleClick={() => startEditing('deliverable', task.deliverable)}
                title="Double-click to edit"
              >
                {task.deliverable}
              </p>
            )}
          </div>

          {/* Core Fields (Project & Assignee) */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Project</h3>
              {editingField === 'objective' ? (
                <select
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={handleKeyDown}
                  disabled={isSaving}
                  className="w-full p-1 border rounded disabled:bg-gray-100"
                >
                  <option value="IMPACT NXT">IMPACT NXT</option>
                  <option value="STEP">STEP</option>
                  <option value="HEIRIT">HEIRIT</option>
                  <option value="Lab-In-a-Box">Lab-In-a-Box</option>
                  <option value="BlueNest">BlueNest</option>
                  <option value="CBIG">CBIG</option>
                  <option value="ISG">ISG</option>
                  <option value="PEG">PEG</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              ) : (
                <p
                  className="text-gray-900 cursor-pointer hover:bg-gray-50 p-1 rounded border border-transparent hover:border-gray-200 transaction-colors"
                  onDoubleClick={() => startEditing('objective', task.objective)}
                  title="Double-click to edit"
                >
                  {getObjectiveTitle(task.objective)}
                </p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Assignee</h3>
              {editingField === 'assignee' ? (
                <input
                  type="text"
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={handleKeyDown}
                  disabled={isSaving}
                  className="w-full p-1 border rounded disabled:bg-gray-100"
                />
              ) : (
                <p
                  className="text-gray-900 cursor-pointer hover:bg-gray-50 p-1 rounded border border-transparent hover:border-gray-200 transaction-colors"
                  onDoubleClick={() => startEditing('assignee', task.assignee)}
                  title="Double-click to edit"
                >
                  {task.assignee}
                </p>
              )}
            </div>
          </div>

          {/* Intent */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Intent / Purpose</h3>
            {editingField === 'intent' ? (
              <textarea
                autoFocus
                value={editValue || ''}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={saveEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    saveEdit();
                  } else if (e.key === 'Escape') {
                    cancelEditing();
                  }
                }}
                className="w-full p-2 border rounded-lg min-h-[80px] disabled:bg-gray-100"
                disabled={isSaving}
                placeholder="What is the purpose of this task?"
              />
            ) : (
              <p
                className={`p-4 rounded-lg cursor-pointer border border-transparent hover:border-gray-300 transition-colors ${task.intent ? 'text-gray-900 bg-gray-50 hover:bg-gray-100' : 'text-gray-400 italic bg-gray-50 hover:bg-gray-100'
                  }`}
                onDoubleClick={() => startEditing('intent', task.intent)}
                title="Double-click to edit"
              >
                {task.intent || 'No intent provided. Double-click to add.'}
              </p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Start Date</h3>
              {editingField === 'startDate' ? (
                <input
                  type="date"
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={handleKeyDown}
                  disabled={isSaving}
                  className="w-full p-1 border rounded disabled:bg-gray-100"
                />
              ) : (
                <p
                  className="text-gray-900 cursor-pointer hover:bg-gray-50 p-1 rounded border border-transparent hover:border-gray-200 transaction-colors"
                  onDoubleClick={() => startEditing('startDate', task.startDate)}
                  title="Double-click to edit"
                >
                  {formatDate(task.startDate)}
                </p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Due Date</h3>
              {editingField === 'dueDate' ? (
                <input
                  type="date"
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={handleKeyDown}
                  disabled={isSaving}
                  className="w-full p-1 border rounded disabled:bg-gray-100"
                />
              ) : (
                <p
                  className="text-gray-900 cursor-pointer hover:bg-gray-50 p-1 rounded border border-transparent hover:border-gray-200 transaction-colors"
                  onDoubleClick={() => startEditing('dueDate', task.dueDate)}
                  title="Double-click to edit"
                >
                  {formatDate(task.dueDate)}
                </p>
              )}
            </div>
          </div>

          {/* Evidence */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Evidence</h3>
            {editingField === 'evidence' ? (
              <textarea
                autoFocus
                value={Array.isArray(editValue) ? editValue.join('\n') : editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={saveEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    saveEdit();
                  } else if (e.key === 'Escape') {
                    cancelEditing();
                  }
                }}
                className="w-full p-2 border rounded-lg min-h-[100px] disabled:bg-gray-100"
                disabled={isSaving}
                placeholder="Enter evidence URL or description"
              />
            ) : (
              <p
                className="text-gray-900 bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 border border-transparent hover:border-gray-300 transition-colors"
                onDoubleClick={() => startEditing('evidence', task.evidence)}
                title="Double-click to edit"
              >
                {Array.isArray(task.evidence) ? task.evidence.join(', ') : (task.evidence || 'No evidence provided')}
              </p>
            )}
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Linked Tasks */}
          {task.linkedTasks && task.linkedTasks.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Linked Tasks</h3>
              <p className="text-gray-600 text-sm">{task.linkedTasks.length} linked task(s)</p>
            </div>
          )}

          {/* Related SOPs */}
          {relatedSOPs.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Related SOPs</h3>
              <div className="space-y-2">
                {relatedSOPs.map((sop) => (
                  <div
                    key={sop.sopId}
                    className="border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{sop.title}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="capitalize">{sop.category}</span>
                          {sop.tags.length > 0 && (
                            <span className="ml-2">• {sop.tags.slice(0, 2).join(', ')}</span>
                          )}
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                        v{sop.version}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Task History Timeline */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Task History</h3>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
              >
                {showHistory ? 'Hide History' : 'Show History'}
              </button>
            </div>

            {showHistory && (
              <div className="space-y-4">
                {auditLogs
                  .filter(log =>
                    // Filter for meaningful updates: comments, status changes, creation
                    log.reason ||
                    log.action === 'status_changed' ||
                    log.action === 'created' ||
                    log.action === 'completed'
                  )
                  .sort((a, b) => {
                    // Sort descending by timestamp
                    const timeA = a.timestamp._seconds ? a.timestamp._seconds : new Date(a.timestamp).getTime() / 1000;
                    const timeB = b.timestamp._seconds ? b.timestamp._seconds : new Date(b.timestamp).getTime() / 1000;
                    return timeB - timeA;
                  })
                  .map((log) => (
                    <div key={log.eventId} className="flex gap-3">
                      <div className="flex-none flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                          ${log.action === 'created' ? 'bg-green-100 text-green-700' :
                            log.action === 'status_changed' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'}`}
                        >
                          {log.action === 'created' ? '★' :
                            log.action === 'status_changed' ? '↻' :
                              '✎'}
                        </div>
                        <div className="w-0.5 flex-1 bg-gray-100 my-1"></div>
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-900">
                            {log.userId}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(log.timestamp)}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600 mt-0.5">
                          {log.action === 'created' ? 'Created task' :
                            log.action === 'status_changed' ? (
                              <span>
                                Changed status from <span className="font-medium">{log.previousState?.status || 'Unknown'}</span> to <span className="font-medium text-gray-900">{log.newState?.status || 'Unknown'}</span>
                              </span>
                            ) :
                              `Updated ${log.action.replace('_', ' ')}`
                          }
                        </div>

                        {log.reason && (
                          <div className="mt-2 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-3">
                            {log.reason}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                {auditLogs.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    No history available for this task.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Created by:</span>
                <span className="ml-2 text-gray-900">{task.createdBy}</span>
              </div>
              <div>
                <span className="text-gray-600">Last modified by:</span>
                <span className="ml-2 text-gray-900">{task.lastModifiedBy}</span>
              </div>
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2 text-gray-900">{formatDate(task.createdAt)}</span>
              </div>
              <div>
                <span className="text-gray-600">Updated:</span>
                <span className="ml-2 text-gray-900">{formatDate(task.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
