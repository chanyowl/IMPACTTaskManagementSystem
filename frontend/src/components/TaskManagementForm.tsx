/**
 * Task Management Form
 *
 * Create/Edit task form with ontology validation
 * Enforces all mandatory fields
 */

import React, { useState } from 'react';
import { useTaskManagement } from '../context/TaskManagementContext';
import type { CreateTaskData } from '../services/taskManagementApi';

import SOPSelector from './SOPSelector';

interface TaskManagementFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function TaskManagementForm({ onClose, onSuccess }: TaskManagementFormProps) {
  const { createNewTask } = useTaskManagement();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateTaskData>({
    objective: '',
    assignee: '',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    deliverable: '',
    evidence: '',
    intent: '',
    tags: [],
    relatedSOPs: [],
    visibility: ['all']
  });

  const [tagInput, setTagInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await createNewTask(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Create New Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error}
            </div>
          )}

          {/* Project (MANDATORY) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Project <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Select a Project</option>
              <option value="IMPACT NXT">IMPACT NXT</option>
              <option value="STEP">STEP</option>
              <option value="HEIRIT">HEIRIT</option>
              <option value="Lab-In-a-Box">Lab-In-a-Box</option>
              <option value="BlueNest">BlueNest</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Which project does this task belong to?
            </p>
          </div>

          {/* Deliverable (MANDATORY) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Deliverable <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.deliverable}
              onChange={(e) => setFormData({ ...formData, deliverable: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What is the expected output or result?"
            />
          </div>

          {/* Assignee (MANDATORY) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Assignee <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter user ID or email"
            />
          </div>

          {/* Intent (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Intent / Purpose
            </label>
            <textarea
              value={formData.intent}
              onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What is the purpose or intent of this task?"
            />
            <p className="text-xs text-gray-500 mt-1">
              Why is this task important?
            </p>
          </div>

          {/* Dates (MANDATORY) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.startDate as string}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.dueDate as string}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Evidence (MANDATORY) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Evidence <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.evidence as string}
              onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="URL, file path, or description of proof"
            />
            <p className="text-xs text-gray-500 mt-1">
              How will completion be verified?
            </p>
          </div>

          {/* Link SOPs (Optional) */}
          <SOPSelector
            selectedSOPIds={formData.relatedSOPs || []}
            onChange={(sopIds) => setFormData({ ...formData, relatedSOPs: sopIds })}
          />

          {/* Tags (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tags (Optional)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Add tags (e.g., urgent, frontend)"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-blue-900 hover:text-blue-700 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
