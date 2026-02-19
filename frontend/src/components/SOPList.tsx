/**
 * SOP List Component
 *
 * Displays SOPs in a grid/list view
 */

import type { SOP, SOPCategory } from '../services/sopApi';

interface SOPListProps {
  sops: SOP[];
  onSelect: (sop: SOP) => void;
  onEdit: (sop: SOP) => void;
}

export default function SOPList({ sops, onSelect, onEdit }: SOPListProps) {
  const formatDate = (date: any) => {
    const d = new Date(date.seconds ? date.seconds * 1000 : date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category: SOPCategory) => {
    const colors: Record<SOPCategory, string> = {
      process: 'bg-blue-100 text-blue-700',
      guideline: 'bg-green-100 text-green-700',
      policy: 'bg-red-100 text-red-700',
      tutorial: 'bg-purple-100 text-purple-700',
      reference: 'bg-yellow-100 text-yellow-700',
      template: 'bg-pink-100 text-pink-700',
      other: 'bg-gray-100 text-gray-700'
    };
    return colors[category] || colors.other;
  };

  const getCategoryIcon = (category: SOPCategory) => {
    const icons: Record<SOPCategory, string> = {
      process: '🔄',
      guideline: '📋',
      policy: '⚖️',
      tutorial: '📚',
      reference: '📖',
      template: '📄',
      other: '📝'
    };
    return icons[category] || icons.other;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sops.map((sop) => (
        <div
          key={sop.sopId}
          className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onSelect(sop)}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getCategoryIcon(sop.category)}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(sop.category)}`}>
                  {sop.category}
                </span>
              </div>
              {sop.isTemplate && (
                <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold">
                  Template
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
              {sop.title}
            </h3>

            {/* Content Preview */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {sop.content.replace(/[#*`]/g, '').substring(0, 150)}...
            </p>

            {/* Tags */}
            {sop.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {sop.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {sop.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    +{sop.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{sop.viewCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>v{sop.version}</span>
                </div>
              </div>
              <div>{formatDate(sop.lastUpdated)}</div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(sop);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                View
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(sop);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
