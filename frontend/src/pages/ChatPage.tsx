import { useState, useEffect } from 'react';
import ChatInterface from '../components/ChatInterface';
import TaskSuggestionCard from '../components/TaskSuggestionCard';
import OnboardingFlow from '../components/OnboardingFlow';
import type { Message, TaskSuggestion } from '../types/index';
import { sendMessage, getTaskSuggestion, submitTaskFeedback } from '../services/api';

// For MVP, we'll use a simple user ID (in production, this would come from auth)
const USER_ID = 'demo-user-1';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [currentSuggestion, setCurrentSuggestion] = useState<TaskSuggestion | null>(null);
  const [showSuggestionButton, setShowSuggestionButton] = useState(false);

  useEffect(() => {
    // Check if user has used the app before (simple localStorage check)
    const hasCompletedOnboarding = localStorage.getItem('trixie_onboarded');
    if (hasCompletedOnboarding) {
      setShowOnboarding(false);
      loadWelcomeMessage();
    }
  }, []);

  const loadWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: 'welcome-1',
      message: "Hi! I'm Trixie. Just dump everything that's on your mind right now—work, life, chores. Messy is fine.",
      sender: 'trixie',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('trixie_onboarded', 'true');
    setShowOnboarding(false);
    loadWelcomeMessage();
  };

  const handleSendMessage = async (messageText: string) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      message: messageText,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    setIsLoading(true);

    try {
      // Send to backend
      const response = await sendMessage(USER_ID, messageText);

      // Add Trixie's response
      const trixieMessage: Message = {
        id: `trixie-${Date.now()}`,
        message: response.response,
        sender: 'trixie',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, trixieMessage]);

      // After a few messages, show suggestion button
      if (messages.length > 4) {
        setShowSuggestionButton(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        message: "I'm having trouble connecting right now. Please make sure the backend server is running.",
        sender: 'trixie',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetSuggestion = async () => {
    setIsLoading(true);
    try {
      const suggestion = await getTaskSuggestion(USER_ID);
      if (suggestion) {
        setCurrentSuggestion(suggestion);
      } else {
        const noTasksMessage: Message = {
          id: `info-${Date.now()}`,
          message: "You don't have any pending tasks yet. Tell me what you need to do, and I'll help you figure out when to tackle it.",
          sender: 'trixie',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, noTasksMessage]);
      }
    } catch (error) {
      console.error('Error getting suggestion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptTask = async () => {
    if (!currentSuggestion) return;

    try {
      await submitTaskFeedback(currentSuggestion.task.id, { action: 'accept' });
      const successMessage: Message = {
        id: `success-${Date.now()}`,
        message: `Great! Let me know how it goes with "${currentSuggestion.task.description}". I'm here if you need to talk through anything.`,
        sender: 'trixie',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, successMessage]);
      setCurrentSuggestion(null);
    } catch (error) {
      console.error('Error accepting task:', error);
    }
  };

  const handleSnoozeTask = async () => {
    if (!currentSuggestion) return;

    try {
      await submitTaskFeedback(currentSuggestion.task.id, { action: 'snooze' });
      const snoozeMessage: Message = {
        id: `snooze-${Date.now()}`,
        message: "No problem. We'll save that for another time. What does feel doable right now?",
        sender: 'trixie',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, snoozeMessage]);
      setCurrentSuggestion(null);
    } catch (error) {
      console.error('Error snoozing task:', error);
    }
  };

  const handleWrongRead = async () => {
    if (!currentSuggestion) return;

    try {
      await submitTaskFeedback(currentSuggestion.task.id, { action: 'wrong_read', reason: 'User indicated wrong read' });
      const wrongReadMessage: Message = {
        id: `wrongread-${Date.now()}`,
        message: "Thanks for letting me know I misread that. Can you help me understand what I got wrong?",
        sender: 'trixie',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, wrongReadMessage]);
      setCurrentSuggestion(null);
    } catch (error) {
      console.error('Error handling wrong read:', error);
    }
  };

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 shadow-md">
        <h1 className="text-2xl font-bold">Trixie</h1>
        <p className="text-sm text-blue-100">Your thoughtful task companion</p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Task Insights</h2>

          {/* Suggestion Button */}
          {showSuggestionButton && !currentSuggestion && (
            <button
              onClick={handleGetSuggestion}
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-colors mb-4 disabled:bg-gray-300"
            >
              Suggest a Task
            </button>
          )}

          {/* Current Suggestion */}
          {currentSuggestion && (
            <TaskSuggestionCard
              suggestion={currentSuggestion}
              onAccept={handleAcceptTask}
              onSnooze={handleSnoozeTask}
              onWrongRead={handleWrongRead}
            />
          )}

          {/* Info */}
          {!currentSuggestion && !showSuggestionButton && (
            <div className="text-sm text-gray-600">
              <p className="mb-3">Tell me about your tasks, and I'll suggest what might fit your current energy and focus.</p>
              <p className="text-xs text-gray-500">The more we chat, the better I understand your work style.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
