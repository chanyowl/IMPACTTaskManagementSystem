/**
 * Task Management Card
 *
 * Individual task display for Kanban board
 */

import { useState } from 'react';
import type { TaskManagement } from '../services/taskManagementApi';
import { useTaskManagement } from '../context/TaskManagementContext';
import TaskManagementDetails from './TaskManagementDetails';

interface TaskManagementCardProps {
  task: TaskManagement;
  onDragStart: () => void;
}

export default function TaskManagementCard({ task, onDragStart }: TaskManagementCardProps) {
  const { deleteExistingTask, refreshTasks } = useTaskManagement();
  const [showDetails, setShowDetails] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasUpdates, setHasUpdates] = useState(false);



  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    setIsDeleting(true);
    try {
      await deleteExistingTask(task.taskId, 'Deleted from Kanban board');
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  // Check if task is overdue
  const isOverdue = () => {
    if (task.status === 'Done') return false;
    try {
      if (!task.dueDate) return false;

      let dueDate: Date;
      if (task.dueDate._seconds !== undefined) {
        // Firestore Timestamp with _seconds
        dueDate = new Date(task.dueDate._seconds * 1000);
      } else if (task.dueDate.seconds !== undefined) {
        // Firestore Timestamp with seconds
        dueDate = new Date(task.dueDate.seconds * 1000);
      } else if (typeof task.dueDate === 'string') {
        // ISO string
        dueDate = new Date(task.dueDate);
      } else if (task.dueDate instanceof Date) {
        // Already a Date object
        dueDate = task.dueDate;
      } else {
        // Unknown format
        dueDate = new Date(task.dueDate);
      }

      if (isNaN(dueDate.getTime())) return false;
      return dueDate < new Date();
    } catch {
      return false;
    }
  };

  const formatDate = (date: any) => {
    try {
      // console.log('formatDate input:', date, typeof date);

      let d: Date;
      if (!date) {
        return 'No Date';
      }

      if (date._seconds !== undefined) {
        // Firestore Timestamp with _seconds (from Firestore SDK)
        d = new Date(date._seconds * 1000);
      } else if (date.seconds !== undefined) {
        // Firestore Timestamp with seconds
        d = new Date(date.seconds * 1000);
      } else if (typeof date === 'string') {
        // ISO string or date string
        d = new Date(date);
      } else if (date instanceof Date) {
        // Already a Date object
        d = date;
      } else {
        // Unknown format, try to convert
        d = new Date(date);
      }

      // Check if date is valid
      if (isNaN(d.getTime())) {
        return 'Invalid Date';
      }

      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  return (
    <>
      <div
        draggable
        onDragStart={onDragStart}
        className={`bg-white rounded-lg shadow p-4 cursor-move hover:shadow-lg transition-shadow border-l-4 ${isOverdue()
          ? 'border-red-500'
          : task.status === 'Done'
            ? 'border-green-500'
            : task.status === 'Active'
              ? 'border-blue-500'
              : 'border-yellow-500'
          }`}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <h3
            className="font-semibold text-gray-900 flex-1 cursor-pointer hover:text-blue-600 leading-tight"
            onClick={() => setShowDetails(true)}
          >
            {task.deliverable.substring(0, 60)}
            {task.deliverable.length > 60 && '...'}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent event bubbling
              handleDelete();
            }}
            onMouseDown={(e) => e.stopPropagation()} // Prevent drag start
            disabled={isDeleting}
            className="text-gray-400 hover:text-red-600 ml-2 transition-colors"
            title="Delete task"
          >
            {isDeleting ? '...' : '✕'}
          </button>
        </div>

        {/* Assignee */}
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <span className="mr-2">👤</span>
          <span>{task.assignee}</span>
        </div>

        {/* Intent */}
        {task.intent && (
          <div className="text-xs text-gray-500 mb-2 line-clamp-2 italic border-l-2 border-gray-200 pl-2">
            {task.intent}
          </div>
        )}

        {/* Dates */}
        <div className="flex flex-col gap-1 mb-2 text-xs">
          <div className="text-gray-500">
            Start: <span className="text-gray-700">{formatDate(task.startDate)}</span>
          </div>
          <div className={`${isOverdue() ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
            Due: <span className={isOverdue() ? 'text-red-600' : 'text-gray-700'}>{formatDate(task.dueDate)}</span>
          </div>
        </div>

        {/* Evidence */}
        <div className="text-xs mb-2">
          {(Array.isArray(task.evidence) ? task.evidence.length > 0 : task.evidence) ? (
            <a
              href={(Array.isArray(task.evidence) ? task.evidence[0] : task.evidence)?.startsWith('http') ? (Array.isArray(task.evidence) ? task.evidence[0] : task.evidence) : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <span>📎</span> Evidence Linked
            </a>
          ) : (
            <span className="text-gray-400 text-xs text-opacity-70">No evidence</span>
          )}
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                +{task.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
          <span>v{task.version}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(true);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View Details →
          </button>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <TaskManagementDetails
          taskId={task.taskId}
          onClose={() => {
            setShowDetails(false);
            if (hasUpdates) {
              refreshTasks();
              setHasUpdates(false);
            }
          }}
          onTaskUpdate={() => setHasUpdates(true)}
        />
      )}
    </>
  );
}
