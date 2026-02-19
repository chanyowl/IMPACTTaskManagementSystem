/**
 * AI Assistant Panel
 *
 * UI for AI-assisted task extraction and creation
 * Phase 3: Layer 6 AI Behavior Model
 *
 * CRITICAL: AI NEVER auto-creates tasks - always requires human approval
 */

import React, { useState, useEffect } from 'react';
import { useTaskManagement } from '../context/TaskManagementContext';
import type { AIProposal, AIExtractionResult } from '../services/aiApi';
import { extractActions, checkAIStatus } from '../services/aiApi';

export default function AIAssistantPanel() {
  const { createNewTask } = useTaskManagement();

  const [inputText, setInputText] = useState('');
  const [extractionResult, setExtractionResult] = useState<AIExtractionResult | null>(null);
  const [selectedProposals, setSelectedProposals] = useState<Set<number>>(new Set());
  const [selectedObjective, setSelectedObjective] = useState<string>(''); // Objective ID for all tasks
  const [isExtracting, setIsExtracting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiAvailable, setAiAvailable] = useState(true);

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    const status = await checkAIStatus();
    setAiAvailable(status.available);
    if (!status.available) {
      setError(status.message);
    }
  };

  const handleExtract = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    setIsExtracting(true);
    setError(null);
    setExtractionResult(null);
    setSelectedProposals(new Set());

    try {
      const result = await extractActions(inputText);
      setExtractionResult(result);

      // Auto-select high-confidence proposals (>70%)
      const autoSelect = new Set<number>();
      result.proposals.forEach((proposal, index) => {
        if (proposal.confidence > 0.7 && proposal.validation?.isValid) {
          autoSelect.add(index);
        }
      });
      setSelectedProposals(autoSelect);
    } catch (err: any) {
      setError(err.message || 'Failed to extract actions');
    } finally {
      setIsExtracting(false);
    }
  };

  const toggleProposal = (index: number) => {
    const newSelected = new Set(selectedProposals);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedProposals(newSelected);
  };

  const handleCreateTasks = async () => {
    if (!extractionResult || selectedProposals.size === 0) {
      setError('Please select at least one proposal to create');
      return;
    }

    if (!selectedObjective) {
      setError('Please select a project for these tasks');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const proposals = Array.from(selectedProposals).map(
        index => extractionResult.proposals[index]
      );

      // Create tasks one by one
      for (const proposal of proposals) {
        await createNewTask({
          objective: selectedObjective, // Use selected objective ID
          assignee: proposal.taskData.assignee,
          startDate: proposal.taskData.startDate,
          dueDate: proposal.taskData.dueDate,
          deliverable: proposal.taskData.deliverable,
          evidence: proposal.taskData.evidence,
          tags: proposal.taskData.tags || [],
          visibility: ['all']
        });
      }

      // Success - clear form
      setInputText('');
      setExtractionResult(null);
      setSelectedProposals(new Set());
      alert(`Successfully created ${proposals.length} task(s)!`);
    } catch (err: any) {
      setError(err.message || 'Failed to create tasks');
    } finally {
      setIsCreating(false);
    }
  };

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  if (!aiAvailable) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-yellow-900 mb-2">AI Service Not Available</h2>
          <p className="text-yellow-800 mb-4">{error || 'AI service is not configured'}</p>
          <p className="text-sm text-yellow-700">
            To enable AI features, configure the GEMINI_API_KEY in your backend environment variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI Task Assistant</h2>
            <p className="text-sm text-gray-600 mt-1">
              Extract tasks from meeting notes, emails, or documents
            </p>
          </div>
          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
            ✨ AI Never Auto-Acts
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Paste Your Text Here
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          placeholder="Example:&#10;&#10;Meeting Notes - Feb 6, 2026&#10;&#10;John agreed to review the design mockups by Friday.&#10;Sarah will update the API documentation by next week.&#10;Mike needs to fix the login bug before the sprint ends."
        />

        <button
          onClick={handleExtract}
          disabled={isExtracting || !inputText.trim()}
          className="mt-4 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isExtracting ? (
            <>
              <span className="animate-spin">⚙️</span>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>🤖</span>
              <span>Extract Actions</span>
            </>
          )}
        </button>
      </div>

      {/* Objective Selector - Only show if we have extraction results */}
      {extractionResult && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Project for All Tasks *
          </label>
          <select
            value={selectedObjective}
            onChange={(e) => setSelectedObjective(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Choose a project --</option>
            {['IMPACT NXT', 'STEP', 'HEIRIT', 'Lab-In-a-Box', 'BlueNest'].map((project) => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm text-gray-600">
            All AI-extracted tasks will be assigned to this project
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Extraction Results */}
      {extractionResult && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Summary</h3>
            <p className="text-blue-800 text-sm">{extractionResult.summary}</p>
            <div className="mt-2 flex items-center gap-4 text-sm">
              <span className="text-blue-700">
                Overall Confidence: <strong>{formatConfidence(extractionResult.overallConfidence)}</strong>
              </span>
              <span className="text-blue-700">
                Found: <strong>{extractionResult.proposals.length}</strong> task(s)
              </span>
            </div>
          </div>

          {/* Clarifying Questions */}
          {extractionResult.clarifyingQuestions.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">❓ Clarifying Questions</h3>
              <ul className="space-y-1">
                {extractionResult.clarifyingQuestions.map((question, index) => (
                  <li key={index} className="text-yellow-800 text-sm">• {question}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Proposals */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">AI Proposals (Select to Create)</h3>
            {extractionResult.proposals.map((proposal, index) => (
              <div
                key={index}
                className={`border-2 rounded-lg p-4 transition-all ${selectedProposals.has(index)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedProposals.has(index)}
                    onChange={() => toggleProposal(index)}
                    className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />

                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{proposal.taskData.objective}</h4>
                        <p className="text-sm text-gray-600">Assignee: {proposal.taskData.assignee}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${proposal.confidence > 0.7
                            ? 'bg-green-100 text-green-700'
                            : proposal.confidence > 0.5
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                            }`}
                        >
                          {formatConfidence(proposal.confidence)} confidence
                        </span>
                        {proposal.validation && !proposal.validation.isValid && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                            Invalid
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="text-sm space-y-1 mb-2">
                      <p><strong>Dates:</strong> {proposal.taskData.startDate} → {proposal.taskData.dueDate}</p>
                      <p><strong>Deliverable:</strong> {proposal.taskData.deliverable}</p>
                      <p><strong>Evidence:</strong> {proposal.taskData.evidence}</p>
                      {proposal.taskData.tags && proposal.taskData.tags.length > 0 && (
                        <p>
                          <strong>Tags:</strong> {proposal.taskData.tags.join(', ')}
                        </p>
                      )}
                    </div>

                    {/* Reasoning */}
                    <div className="bg-gray-50 border border-gray-200 rounded p-2 text-sm text-gray-700 mb-2">
                      <strong>Reasoning:</strong> {proposal.reasoning}
                    </div>

                    {/* Ambiguities */}
                    {proposal.ambiguities.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-sm">
                        <strong className="text-yellow-900">Ambiguities:</strong>
                        <ul className="mt-1 space-y-1">
                          {proposal.ambiguities.map((amb, i) => (
                            <li key={i} className="text-yellow-800">• {amb}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Questions */}
                    {proposal.questions.length > 0 && (
                      <div className="mt-2 text-sm text-blue-700">
                        <strong>Questions:</strong> {proposal.questions.join(' ')}
                      </div>
                    )}

                    {/* Validation Errors */}
                    {proposal.validation && proposal.validation.errors.length > 0 && (
                      <div className="mt-2 bg-red-50 border border-red-200 rounded p-2 text-sm">
                        <strong className="text-red-900">Errors:</strong>
                        <ul className="mt-1 space-y-1">
                          {proposal.validation.errors.map((err, i) => (
                            <li key={i} className="text-red-800">• {err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreateTasks}
            disabled={isCreating || selectedProposals.size === 0}
            className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium text-lg transition-colors"
          >
            {isCreating
              ? 'Creating Tasks...'
              : `Create ${selectedProposals.size} Selected Task${selectedProposals.size !== 1 ? 's' : ''}`}
          </button>

          <p className="text-center text-sm text-gray-500">
            ✅ You have final approval - AI proposals never auto-create tasks
          </p>
        </div>
      )}
    </div>
  );
}
