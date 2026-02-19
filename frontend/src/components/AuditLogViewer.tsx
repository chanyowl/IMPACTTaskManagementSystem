/**
 * Audit Log Viewer
 *
 * Displays audit history with timeline view and diff
 */

import React from 'react';
import type { AuditLog } from '../services/taskManagementApi';

interface AuditLogViewerProps {
  auditLogs: AuditLog[];
}

export default function AuditLogViewer({ auditLogs }: AuditLogViewerProps) {
  const formatTimestamp = (timestamp: any) => {
    const date = new Date(timestamp.seconds ? timestamp.seconds * 1000 : timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return '✨';
      case 'updated':
        return '✏️';
      case 'status_changed':
        return '🔄';
      case 'reassigned':
        return '👤';
      case 'deleted':
        return '🗑️';
      case 'linked':
        return '🔗';
      case 'unlinked':
        return '⛓️‍💥';
      default:
        return '📝';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'deleted':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'status_changed':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'reassigned':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const renderChange = (log: AuditLog) => {
    if (!log.previousState) {
      return <div className="text-sm text-gray-600 italic">Task created</div>;
    }

    const changes: string[] = [];

    // Compare states
    const prev = log.previousState as any;
    const curr = log.newState as any;

    Object.keys(curr).forEach((key) => {
      if (JSON.stringify(prev[key]) !== JSON.stringify(curr[key])) {
        changes.push(`${key}: ${JSON.stringify(prev[key])} → ${JSON.stringify(curr[key])}`);
      }
    });

    if (changes.length === 0) {
      return null;
    }

    return (
      <div className="mt-2 space-y-1">
        {changes.map((change, index) => (
          <div key={index} className="text-sm text-gray-700 font-mono bg-white p-2 rounded">
            {change}
          </div>
        ))}
      </div>
    );
  };

  if (auditLogs.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No audit logs available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900">Audit History</h3>
      <p className="text-sm text-gray-600">
        Complete history of all changes (immutable audit trail)
      </p>

      <div className="space-y-3">
        {auditLogs.map((log) => (
          <div
            key={log.eventId}
            className={`border rounded-lg p-4 ${getActionColor(log.action)}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getActionIcon(log.action)}</span>
                <div>
                  <div className="font-semibold text-sm">
                    {log.action.replace('_', ' ').toUpperCase()}
                  </div>
                  <div className="text-xs opacity-75">
                    by {log.userId} • {formatTimestamp(log.timestamp)}
                  </div>
                </div>
              </div>
              <div className="text-xs font-mono bg-white px-2 py-1 rounded">
                {log.eventId.substring(0, 8)}
              </div>
            </div>

            {/* Reason */}
            {log.reason && (
              <div className="mt-2 text-sm italic">
                Reason: {log.reason}
              </div>
            )}

            {/* Changes */}
            {renderChange(log)}
          </div>
        ))}
      </div>

      {/* Export Button */}
      <button
        onClick={() => {
          const dataStr = JSON.stringify(auditLogs, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `audit-logs-${Date.now()}.json`;
          link.click();
        }}
        className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
      >
        📥 Export Audit Logs
      </button>
    </div>
  );
}
