import { useState } from 'react';
import { TaskManagementProvider } from './context/TaskManagementContext';
import TaskManagementBoard from './components/TaskManagementBoard';
import KnowledgeBase from './components/KnowledgeBase';
import AIAssistantPanel from './components/AIAssistantPanel';
import ReportGenerator from './components/ReportGenerator';
import './index.css';

type View = 'tasks' | 'knowledge' | 'ai' | 'reports';

function App() {
  const [currentView, setCurrentView] = useState<View>('tasks');

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentView('tasks')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentView === 'tasks'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Task Management
                </button>
                <button
                  onClick={() => setCurrentView('knowledge')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentView === 'knowledge'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Knowledge Base
                </button>
                <button
                  onClick={() => setCurrentView('ai')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${currentView === 'ai'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <span>🤖</span>
                  <span>AI Assistant</span>
                </button>
                <button
                  onClick={() => setCurrentView('reports')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${currentView === 'reports'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Reports</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <TaskManagementProvider>
        <div className="flex-1 relative overflow-hidden">
          <div style={{ display: currentView === 'tasks' ? 'block' : 'none', height: '100%' }} className="overflow-y-auto">
            <TaskManagementBoard />
          </div>

          <div style={{ display: currentView === 'knowledge' ? 'block' : 'none', height: '100%' }} className="overflow-y-auto">
            <KnowledgeBase />
          </div>

          <div style={{ display: currentView === 'ai' ? 'block' : 'none', height: '100%' }} className="overflow-y-auto">
            <AIAssistantPanel />
          </div>

          <div style={{ display: currentView === 'reports' ? 'block' : 'none', height: '100%' }} className="overflow-y-auto">
            <ReportGenerator />
          </div>
        </div>
      </TaskManagementProvider>
    </div>
  );
}

export default App;
