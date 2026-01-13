import React from 'react';
import { User } from '../types';

interface UserFormProps {
  currentUserName: string;
  onNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onClear: () => void;
  editingUser: User | null;
}

const UserForm: React.FC<UserFormProps> = ({
  currentUserName,
  onNameChange,
  onSave,
  onClear,
  editingUser,
}) => {
  return (
    <div className="p-8 bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700/50 mb-8 w-full max-w-xl overflow-hidden">
      <h2 className="text-4xl font-extrabold text-white mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-500 uppercase tracking-tighter">
        {editingUser ? 'Edit Player' : 'Add New Player'}
      </h2>
      <div className="flex flex-col gap-4 mb-2">
        <input
          type="text"
          placeholder="Enter player name"
          value={currentUserName}
          onChange={onNameChange}
          className="w-full p-4 rounded-xl bg-gray-900 bg-opacity-80 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 border border-gray-700 shadow-inner text-lg font-bold"
          aria-label="Player name input"
        />
        <div className="flex flex-row gap-3 w-full">
          <button
            onClick={onSave}
            className="flex-grow bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-black py-3 px-4 rounded-xl shadow-lg transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-900 text-sm sm:text-base uppercase tracking-widest"
            aria-label={editingUser ? 'Update player' : 'Add player'}
          >
            {editingUser ? 'Update' : 'Add Player'}
          </button>
          <button
            onClick={onClear}
            disabled={currentUserName.trim() === '' && editingUser === null}
            className={`px-6 py-3 rounded-xl font-black shadow-lg transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 text-sm sm:text-base uppercase tracking-widest ${
              currentUserName.trim() === '' && editingUser === null
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-70'
                : 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500'
            }`}
            aria-label="Clear form"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserForm;