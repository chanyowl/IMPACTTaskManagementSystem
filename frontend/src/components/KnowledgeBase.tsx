/**
 * Knowledge Base Component
 *
 * Main container for SOP management
 * Provides search, filtering, and navigation
 */

import { useState, useEffect } from 'react';
import type { SOP } from '../services/sopApi';
import {
  getRecentSOPs,
  getPopularSOPs,
  searchSOPs,
  listSOPs
} from '../services/sopApi';
import SOPList from './SOPList';
import SOPSearch from './SOPSearch';
import SOPViewer from './SOPViewer';
import SOPEditor from './SOPEditor';

type View = 'list' | 'view' | 'edit' | 'create';

export default function KnowledgeBase() {
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedSOP, setSelectedSOP] = useState<SOP | null>(null);
  const [sops, setSOPs] = useState<SOP[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'recent' | 'popular' | 'all' | 'templates'>('recent');

  useEffect(() => {
    loadSOPs();
  }, [activeTab, searchQuery]);

  const loadSOPs = async () => {
    try {
      setLoading(true);

      if (searchQuery) {
        const results = await searchSOPs({ query: searchQuery, limit: 50 });
        setSOPs(results.map(r => r.sop));
      } else {
        switch (activeTab) {
          case 'recent':
            const recent = await getRecentSOPs(20);
            setSOPs(recent);
            break;
          case 'popular':
            const popular = await getPopularSOPs(20);
            setSOPs(popular);
            break;
          case 'templates':
            const templates = await listSOPs({ isTemplate: true, status: 'published' });
            setSOPs(templates);
            break;
          case 'all':
          default:
            const all = await listSOPs({ status: 'published' });
            setSOPs(all);
            break;
        }
      }
    } catch (error) {
      console.error('Error loading SOPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSOPSelect = (sop: SOP) => {
    setSelectedSOP(sop);
    setCurrentView('view');
  };

  const handleEdit = (sop: SOP) => {
    setSelectedSOP(sop);
    setCurrentView('edit');
  };

  const handleCreate = () => {
    setSelectedSOP(null);
    setCurrentView('create');
  };

  const handleSave = () => {
    setCurrentView('list');
    setSelectedSOP(null);
    loadSOPs();
  };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedSOP(null);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
            {currentView === 'list' && (
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
              >
                <span>+</span>
                <span>New SOP</span>
              </button>
            )}
          </div>

          {/* Search Bar */}
          {currentView === 'list' && (
            <SOPSearch onSearch={handleSearch} />
          )}

          {/* Tabs */}
          {currentView === 'list' && !searchQuery && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setActiveTab('recent')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'recent'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Recent
              </button>
              <button
                onClick={() => setActiveTab('popular')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'popular'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Popular
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                All SOPs
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'templates'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Templates
              </button>
            </div>
          )}

          {/* Back Button */}
          {currentView !== 'list' && (
            <button
              onClick={handleCancel}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
            >
              <span>←</span>
              <span>Back to list</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {currentView === 'list' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-lg text-gray-600">Loading SOPs...</div>
              </div>
            ) : sops.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  {searchQuery
                    ? `No SOPs found matching "${searchQuery}"`
                    : 'No SOPs available'}
                </div>
                {!searchQuery && (
                  <button
                    onClick={handleCreate}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Create your first SOP
                  </button>
                )}
              </div>
            ) : (
              <SOPList
                sops={sops}
                onSelect={handleSOPSelect}
                onEdit={handleEdit}
              />
            )}
          </>
        )}

        {currentView === 'view' && selectedSOP && (
          <SOPViewer
            sop={selectedSOP}
            onEdit={() => handleEdit(selectedSOP)}
            onClose={handleCancel}
          />
        )}

        {(currentView === 'edit' || currentView === 'create') && (
          <SOPEditor
            sop={currentView === 'edit' ? selectedSOP : undefined}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}
