import { useState } from 'react';
import React, { useRef } from 'react';

export default function Home({ onCreate, onJoin }) {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-center mb-6">🎨 Draw & Guess</h1>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter your name"
          />
        </div>

        {!isCreating ? (
          <>
            <button
              onClick={() => {
                if (!name.trim()) return alert('Please enter your name');
                onCreate(name);
              }}
              className="w-full bg-blue-500 text-white py-2 rounded mb-3 hover:bg-blue-600 transition"
            >
              Create Game
            </button>
            <button
              onClick={() => setIsCreating(true)}
              className="w-full bg-gray-200 py-2 rounded hover:bg-gray-300 transition"
            >
              Join Game
            </button>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Room Code</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-full p-2 border rounded uppercase"
                placeholder="Enter room code"
              />
            </div>
            <button
              onClick={() => {
                if (!name.trim()) return alert('Please enter your name');
                if (!roomCode.trim()) return alert('Please enter room code');
                onJoin(roomCode, name);
              }}
              className="w-full bg-green-500 text-white py-2 rounded mb-3 hover:bg-green-600 transition"
            >
              Join
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="w-full bg-gray-200 py-2 rounded hover:bg-gray-300 transition"
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}