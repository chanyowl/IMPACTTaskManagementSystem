/**
 * Objective Selector
 *
 * Dropdown for selecting objectives with ability to create new ones
 */

import { useState } from 'react';
import { useTaskManagement } from '../context/TaskManagementContext';
import { createObjective } from '../services/taskManagementApi';

interface ObjectiveSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ObjectiveSelector({ value, onChange }: ObjectiveSelectorProps) {
  const { objectives, refreshObjectives } = useTaskManagement();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newObjective, setNewObjective] = useState({
    title: '',
    description: '',
    owner: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateObjective = async () => {
    if (!newObjective.title || !newObjective.description || !newObjective.owner) {
      alert('Please fill in all fields');
      return;
    }

    setIsCreating(true);
    try {
      const created = await createObjective(newObjective);
      await refreshObjectives();
      onChange(created.objectiveId);
      setShowCreateForm(false);
      setNewObjective({ title: '', description: '', owner: '' });
    } catch (error: any) {
      alert(`Failed to create objective: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <select
        value={value}
        onChange={(e) => {
          if (e.target.value === 'CREATE_NEW') {
            setShowCreateForm(true);
          } else {
            onChange(e.target.value);
          }
        }}
        required
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Select an objective...</option>
        {objectives.map((obj) => (
          <option key={obj.objectiveId} value={obj.objectiveId}>
            {obj.title}
          </option>
        ))}
        <option value="CREATE_NEW" className="font-semibold text-blue-600">
          + Create New Objective
        </option>
      </select>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Objective</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newObjective.title}
                  onChange={(e) =>
                    setNewObjective({ ...newObjective, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Q1 Product Launch"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={newObjective.description}
                  onChange={(e) =>
                    setNewObjective({ ...newObjective, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the objective..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Owner *
                </label>
                <input
                  type="text"
                  value={newObjective.owner}
                  onChange={(e) =>
                    setNewObjective({ ...newObjective, owner: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="User ID or email"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateObjective}
                disabled={isCreating}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
