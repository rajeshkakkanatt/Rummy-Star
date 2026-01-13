
import React from 'react';
import { User } from '../types';

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onToggleCheck: (id: string) => void;
  onProceedToRound: () => void;
}

const UserList: React.FC<UserListProps> = ({ users, onEdit, onDelete, onToggleCheck, onProceedToRound }) => {
  const activePlayersCount = users.filter(u => u.isChecked && !u.isOut).length;

  return (
    <div className="relative w-full max-w-xl">
      {/* Container with extra bottom padding to ensure list items aren't covered by the floating dock */}
      <div className="p-8 pb-32 bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700/50 w-full">
        <h2 className="text-4xl font-extrabold text-white mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-500">Player List</h2>
        
        <ul className="space-y-4 mb-4">
          {users.map((user) => (
            <li
              key={user.id}
              className={`flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl shadow-lg transition-all duration-300 border group ${
                user.isChecked 
                ? 'bg-teal-900/20 border-teal-500/30' 
                : 'bg-gray-900/80 border-gray-700/50 hover:bg-gray-700/80'
              }`}
            >
              <div className="flex items-center flex-grow mb-3 sm:mb-0 w-full sm:w-auto">
                <input
                  type="checkbox"
                  checked={user.isChecked}
                  onChange={() => onToggleCheck(user.id)}
                  className="hidden"
                  id={`checkbox-${user.id}`}
                  aria-label={`Select ${user.name}`}
                />
                <label
                  htmlFor={`checkbox-${user.id}`}
                  className={`relative flex items-center justify-center w-7 h-7 rounded-md border-2 transition-all duration-200 cursor-pointer text-white text-opacity-0 group-hover:text-opacity-100 mr-4
                    ${user.isChecked ? 'bg-teal-500 border-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]' : 'bg-gray-700 border-gray-500'}
                  `}
                >
                  {user.isChecked && (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </label>
                <span className={`text-2xl font-bold transition-colors duration-200 ${user.isChecked ? 'text-teal-300' : 'text-white'}`}>
                  {user.name}
                  {user.isOut && <span className="ml-2 text-sm text-red-400 font-normal uppercase tracking-tighter">(OUT)</span>}
                </span>
              </div>
              
              <div className="flex gap-3 mt-3 sm:mt-0 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(user)}
                  className="bg-blue-600/30 hover:bg-blue-600 text-blue-100 font-bold py-2 px-4 rounded-lg transition-all duration-200 border border-blue-500/30 text-sm uppercase tracking-wide"
                >
                  Edit
                </button>
                {!user.isDefault && (
                  <button
                    onClick={() => onDelete(user.id)}
                    className="bg-red-600/30 hover:bg-red-600 text-red-100 font-bold py-2 px-4 rounded-lg transition-all duration-200 border border-red-500/30 text-sm uppercase tracking-wide"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
          {users.length === 0 && (
            <div className="flex flex-col items-center py-12 text-gray-500">
              <span className="text-5xl mb-4">👥</span>
              <p className="italic">No players added to the roster yet.</p>
            </div>
          )}
        </ul>
      </div>

      {/* 
          PROFESSIONAL FLOATING DOCK 
          Positioned 'fixed' to the bottom of the viewport 
      */}
      <div 
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[100] transition-all duration-500 ease-in-out transform 
          ${activePlayersCount > 0 ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0 pointer-events-none'}`}
      >
        <div className="p-2 bg-gray-950/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7),0_0_20px_rgba(20,184,166,0.15)] overflow-hidden">
          <button
            onClick={onProceedToRound}
            className="group relative w-full flex items-center justify-between py-4 px-6 bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-500 text-white font-black text-xl rounded-[1.5rem] transition-all duration-300 transform active:scale-95 hover:shadow-[0_0_30px_rgba(20,184,166,0.4)]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md shadow-inner text-white text-lg font-black border border-white/20 animate-pulse">
                {activePlayersCount}
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span className="uppercase text-sm tracking-widest text-teal-50 font-bold opacity-80">Proceed to</span>
                <span className="uppercase text-lg tracking-tighter">Start Round session</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 transition-transform duration-500 group-hover:translate-x-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7" />
              </svg>
            </div>

            {/* Shine sweep effect */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shine-once" />
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes shineOnce {
          0% { left: -100%; }
          100% { left: 125%; }
        }
        .group:hover .group-hover\\:animate-shine-once {
          animation: shineOnce 0.7s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default UserList;
