import React from 'react';

interface ResetAppConfirmationProps {
  onResetApp: () => void;
}

const ResetAppConfirmation: React.FC<ResetAppConfirmationProps> = ({ onResetApp }) => {
  return (
    <div className="p-8 bg-red-900 bg-opacity-40 backdrop-blur-md rounded-2xl shadow-2xl border border-red-700/50 w-full max-w-xl text-center">
      <h2 className="text-4xl font-extrabold text-red-300 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-600">Reset Application</h2>
      <p className="text-lg text-gray-200 mb-10 leading-relaxed">
        This action will <span className="font-extrabold text-red-100">permanently delete all custom players, game history, and scores</span>.
        The application will revert to its initial state with only the default players.
        <br/><span className="font-bold text-red-200">This action cannot be undone.</span>
      </p>
      <button
        onClick={onResetApp}
        className="w-full py-4 px-6 rounded-xl font-bold text-xl shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white shadow-red-500/30"
        aria-label="Confirm to reset everything in the app"
      >
        Reset Everything
      </button>
    </div>
  );
};

export default ResetAppConfirmation;