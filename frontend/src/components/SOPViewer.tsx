/**
 * SOP Viewer Component
 *
 * Displays full SOP content with version history and related SOPs
 */

import React, { useState, useEffect } from 'react';
import type { SOP, SOPVersion } from '../services/sopApi';
import {
  getSOPVersions,
  getRelatedSOPs,
  restoreSOPVersion,
  deleteSOP
} from '../services/sopApi';

interface SOPViewerProps {
  sop: SOP;
  onEdit: () => void;
  onClose: () => void;
}

export default function SOPViewer({ sop, onEdit, onClose }: SOPViewerProps) {
  const [versions, setVersions] = useState<SOPVersion[]>([]);
  const [relatedSOPs, setRelatedSOPs] = useState<SOP[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [showRelated, setShowRelated] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVersions();
    loadRelated();
  }, [sop.sopId]);

  const loadVersions = async () => {
    try {
      const versionHistory = await getSOPVersions(sop.sopId);
      setVersions(versionHistory);
    } catch (error) {
      console.error('Error loading versions:', error);
    }
  };

  const loadRelated = async () => {
    try {
      const related = await getRelatedSOPs(sop.sopId);
      setRelatedSOPs(related);
    } catch (error) {
      console.error('Error loading related SOPs:', error);
    }
  };

  const handleRestore = async (versionNumber: number) => {
    if (!confirm(`Restore to version ${versionNumber}? This will create a new version.`)) {
      return;
    }

    try {
      setLoading(true);
      await restoreSOPVersion(sop.sopId, versionNumber);
      alert('Version restored successfully');
      window.location.reload();
    } catch (error: any) {
      alert('Failed to restore version: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to archive this SOP?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteSOP(sop.sopId);
      alert('SOP archived successfully');
      onClose();
    } catch (error: any) {
      alert('Failed to archive SOP: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: any) => {
    const d = new Date(date.seconds ? date.seconds * 1000 : date);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold mt-6 mb-3">{line.substring(2)}</h1>;
        } else if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-bold mt-5 mb-2">{line.substring(3)}</h2>;
        } else if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-bold mt-4 mb-2">{line.substring(4)}</h3>;
        } else if (line.startsWith('- ')) {
          return <li key={index} className="ml-6 list-disc">{line.substring(2)}</li>;
        } else if (line.trim() === '') {
          return <br key={index} />;
        } else {
          return <p key={index} className="mb-2">{line}</p>;
        }
      });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                sop.category === 'process' ? 'bg-blue-100 text-blue-700' :
                sop.category === 'guideline' ? 'bg-green-100 text-green-700' :
                sop.category === 'policy' ? 'bg-red-100 text-red-700' :
                sop.category === 'tutorial' ? 'bg-purple-100 text-purple-700' :
                sop.category === 'reference' ? 'bg-yellow-100 text-yellow-700' :
                sop.category === 'template' ? 'bg-pink-100 text-pink-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {sop.category}
              </span>
              {sop.isTemplate && (
                <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-semibold">
                  Template
                </span>
              )}
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                v{sop.version}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{sop.title}</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:bg-gray-400"
            >
              Archive
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{sop.createdBy}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatDate(sop.lastUpdated)}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{sop.viewCount} views</span>
          </div>
        </div>

        {/* Tags */}
        {sop.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {sop.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <div className="prose max-w-none">
          {formatContent(sop.content)}
        </div>
      </div>

      {/* Version History */}
      <div className="border-t border-gray-200 px-6 py-4">
        <button
          onClick={() => setShowVersions(!showVersions)}
          className="w-full flex items-center justify-between text-left font-semibold text-gray-900 hover:text-blue-600"
        >
          <span>Version History ({versions.length})</span>
          <span>{showVersions ? '−' : '+'}</span>
        </button>

        {showVersions && (
          <div className="mt-4 space-y-3">
            {versions.map((version) => (
              <div
                key={version.versionId}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">
                      Version {version.versionNumber}
                      {version.versionNumber === sop.version && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {version.changeType.replace('_', ' ')} by {version.createdBy}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(version.createdAt)}
                    </div>
                    {version.changeReason && (
                      <div className="text-sm text-gray-700 mt-2 italic">
                        "{version.changeReason}"
                      </div>
                    )}
                    {version.changesSummary && version.changesSummary.length > 0 && (
                      <ul className="text-sm text-gray-600 mt-2 list-disc list-inside">
                        {version.changesSummary.map((change, idx) => (
                          <li key={idx}>{change}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {version.versionNumber !== sop.version && (
                    <button
                      onClick={() => handleRestore(version.versionNumber)}
                      disabled={loading}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      Restore
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related SOPs */}
      {relatedSOPs.length > 0 && (
        <div className="border-t border-gray-200 px-6 py-4">
          <button
            onClick={() => setShowRelated(!showRelated)}
            className="w-full flex items-center justify-between text-left font-semibold text-gray-900 hover:text-blue-600"
          >
            <span>Related SOPs ({relatedSOPs.length})</span>
            <span>{showRelated ? '−' : '+'}</span>
          </button>

          {showRelated && (
            <div className="mt-4 space-y-2">
              {relatedSOPs.map((related) => (
                <div
                  key={related.sopId}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="font-medium text-gray-900">{related.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{related.category}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
