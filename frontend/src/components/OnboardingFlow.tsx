interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Hi! I'm Trixie
          </h1>
          <p className="text-lg text-gray-600">
            Your AI companion for thoughtful task management
          </p>
        </div>

        {/* Welcome Message */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <p className="text-gray-700 leading-relaxed mb-4">
            I'm here to help you manage tasks in a way that feels right for you.
            No rigid schedules or guilt trips—just a calm, curious conversation
            about what you need to do and when you're ready to do it.
          </p>
          <p className="text-gray-700 leading-relaxed">
            To get started, just dump everything that's on your mind right now—work,
            life, chores. Messy is fine. I'll help you sort through it.
          </p>
        </div>

        {/* Key Principles */}
        <div className="space-y-3 mb-8">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">💭</div>
            <div>
              <h3 className="font-semibold text-gray-800">I learn by observing</h3>
              <p className="text-sm text-gray-600">
                I won't ask you to fill out personality tests. I'll learn your patterns naturally.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="text-2xl">🌊</div>
            <div>
              <h3 className="font-semibold text-gray-800">Low pressure, always</h3>
              <p className="text-sm text-gray-600">
                I suggest what might fit your current energy, never what you "should" do.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="text-2xl">🪞</div>
            <div>
              <h3 className="font-semibold text-gray-800">I'm your mirror</h3>
              <p className="text-sm text-gray-600">
                I'll help you notice your own patterns, like when you tend to procrastinate.
              </p>
            </div>
          </div>
        </div>

        {/* Get Started Button */}
        <button
          onClick={onComplete}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-colors shadow-md hover:shadow-lg"
        >
          Let's get started
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">
          Your data stays private. No tracking, no sharing with employers.
        </p>
      </div>
    </div>
  );
}
