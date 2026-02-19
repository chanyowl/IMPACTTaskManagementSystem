/**
 * SOP Editor Component
 *
 * Create/Edit SOP with markdown support
 */

import React, { useState } from 'react';
import type { SOP, SOPCategory, CreateSOPData, UpdateSOPData } from '../services/sopApi';
import { createSOP, updateSOP } from '../services/sopApi';

interface SOPEditorProps {
  sop?: SOP | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function SOPEditor({ sop, onSave, onCancel }: SOPEditorProps) {
  const isEditing = !!sop;

  const [formData, setFormData] = useState({
    title: sop?.title || '',
    category: sop?.category || 'process' as SOPCategory,
    content: sop?.content || '',
    tags: sop?.tags || [],
    status: sop?.status || 'draft' as const,
    isTemplate: sop?.isTemplate || false,
    visibility: sop?.visibility || ['all']
  });

  const [tagInput, setTagInput] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditing) {
        const updateData: UpdateSOPData = {
          title: formData.title,
          category: formData.category,
          content: formData.content,
          tags: formData.tags,
          status: formData.status,
          isTemplate: formData.isTemplate,
          visibility: formData.visibility
        };
        await updateSOP(sop.sopId, updateData, changeReason || undefined);
      } else {
        const createData: CreateSOPData = {
          title: formData.title,
          category: formData.category,
          content: formData.content,
          tags: formData.tags,
          status: formData.status,
          isTemplate: formData.isTemplate,
          visibility: formData.visibility
        };
        await createSOP(createData);
      }

      onSave();
    } catch (err: any) {
      setError(err.message || 'Failed to save SOP');
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit SOP' : 'Create New SOP'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter SOP title"
          />
        </div>

        {/* Category and Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as SOPCategory })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="process">Process</option>
              <option value="guideline">Guideline</option>
              <option value="policy">Policy</option>
              <option value="tutorial">Tutorial</option>
              <option value="reference">Reference</option>
              <option value="template">Template</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Content <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Supports basic markdown: # for headers, - for lists
          </p>
          <textarea
            required
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={15}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="Enter SOP content...&#10;&#10;# Main Title&#10;&#10;## Section 1&#10;Content here...&#10;&#10;- Bullet point 1&#10;- Bullet point 2"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Add tags for better searchability"
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
            {formData.tags.map((tag, index) => (
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

        {/* Template Option */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isTemplate}
              onChange={(e) => setFormData({ ...formData, isTemplate: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-semibold text-gray-700">
              Mark as Template
            </span>
          </label>
          <p className="text-xs text-gray-500 ml-6 mt-1">
            Templates can be used to quickly create new SOPs or tasks
          </p>
        </div>

        {/* Change Reason (for edits) */}
        {isEditing && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Change Reason (Optional)
            </label>
            <input
              type="text"
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Why are you making these changes?"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create SOP'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium disabled:bg-gray-400"
          >
            Cancel
          </button>
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Markdown Formatting Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use # for main titles, ## for subtitles, ### for sub-sections</li>
            <li>• Use - or * for bullet lists</li>
            <li>• Leave blank lines between paragraphs</li>
            <li>• Use **text** for bold (not yet rendered but saved)</li>
          </ul>
        </div>
      </form>
    </div>
  );
}
