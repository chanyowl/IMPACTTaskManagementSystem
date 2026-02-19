import type { TaskSuggestion } from '../types/index';

interface TaskSuggestionCardProps {
  suggestion: TaskSuggestion;
  onAccept: () => void;
  onSnooze: () => void;
  onWrongRead: () => void;
}

export default function TaskSuggestionCard({
  suggestion,
  onAccept,
  onSnooze,
  onWrongRead,
}: TaskSuggestionCardProps) {
  const { task, confidence, reasoning } = suggestion;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Suggested Task</h3>
        {confidence > 0.7 && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {confidence > 0.9 ? 'High confidence' : 'Confident'}
          </span>
        )}
      </div>

      {/* Task Description */}
      <p className="text-gray-900 font-medium mb-3">{task.description}</p>

      {/* Reasoning */}
      <p className="text-sm text-gray-600 mb-4 italic">{reasoning}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {task.inferredTags.map((tag, index) => (
          <span
            key={index}
            className="text-xs bg-white text-gray-700 px-2 py-1 rounded-full border border-gray-200"
          >
            {tag}
          </span>
        ))}
        <span
          className={`text-xs px-2 py-1 rounded-full ${task.cognitiveLoad === 'high'
            ? 'bg-purple-100 text-purple-700 border border-purple-200'
            : 'bg-green-100 text-green-700 border border-green-200'
            }`}
        >
          {task.cognitiveLoad === 'high' ? 'Deep work' : 'Light work'}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onAccept}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Start Now
        </button>
        <button
          onClick={onSnooze}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Not Today
        </button>
        <button
          onClick={onWrongRead}
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg font-medium transition-colors"
          title="Trixie misunderstood"
        >
          ✗
        </button>
      </div>
    </div>
  );
}
