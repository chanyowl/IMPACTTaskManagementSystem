/**
 * SOP Selector Component
 *
 * Select SOPs to link to tasks
 */

import React, { useState, useEffect } from 'react';
import type { SOP } from '../services/sopApi';
import { listSOPs, searchSOPs } from '../services/sopApi';

interface SOPSelectorProps {
  selectedSOPIds: string[];
  onChange: (sopIds: string[]) => void;
}

export default function SOPSelector({ selectedSOPIds, onChange }: SOPSelectorProps) {
  const [sops, setSOPs] = useState<SOP[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSOPs();
  }, [searchQuery]);

  const loadSOPs = async () => {
    try {
      setLoading(true);
      if (searchQuery) {
        const results = await searchSOPs({ query: searchQuery, limit: 10 });
        setSOPs(results.map(r => r.sop));
      } else {
        const allSOPs = await listSOPs({ status: 'published' });
        setSOPs(allSOPs.slice(0, 10));
      }
    } catch (error) {
      console.error('Error loading SOPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedSOPs = sops.filter(sop => selectedSOPIds.includes(sop.sopId));

  const handleSelect = (sopId: string) => {
    if (!selectedSOPIds.includes(sopId)) {
      onChange([...selectedSOPIds, sopId]);
    }
    setShowDropdown(false);
    setSearchQuery('');
  };

  const handleRemove = (sopId: string) => {
    onChange(selectedSOPIds.filter(id => id !== sopId));
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Link SOPs (Optional)
      </label>

      {/* Selected SOPs */}
      {selectedSOPs.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedSOPs.map((sop) => (
            <div
              key={sop.sopId}
              className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-center gap-2 border border-blue-200"
            >
              <span className="font-medium">{sop.title}</span>
              <button
                type="button"
                onClick={() => handleRemove(sop.sopId)}
                className="text-blue-900 hover:text-blue-700 font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search and link SOPs..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-3 text-gray-500 text-sm">Loading...</div>
            ) : sops.length === 0 ? (
              <div className="px-4 py-3 text-gray-500 text-sm">
                {searchQuery ? 'No SOPs found' : 'No published SOPs available'}
              </div>
            ) : (
              <>
                {sops
                  .filter(sop => !selectedSOPIds.includes(sop.sopId))
                  .map((sop) => (
                    <button
                      key={sop.sopId}
                      type="button"
                      onClick={() => handleSelect(sop.sopId)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{sop.title}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="capitalize">{sop.category}</span>
                        {sop.tags.length > 0 && (
                          <span className="ml-2">• {sop.tags.slice(0, 2).join(', ')}</span>
                        )}
                      </div>
                    </button>
                  ))}
              </>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-1">
        Link relevant SOPs to provide context and guidance for this task
      </p>
    </div>
  );
}
