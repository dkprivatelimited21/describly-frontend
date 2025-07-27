import React, { useState, useEffect } from 'react';

export default function Lobby({ players, isHost, roomCode, onStart }) {
  const [rounds, setRounds] = useState(3);
  const [roundTime, setRoundTime] = useState(60);
  const [difficulty, setDifficulty] = useState('easy');

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Room: {roomCode}</h2>
        
        <div className="mb-6">
          <h3 className="font-medium mb-2">Players ({players.length})</h3>
          <div className="bg-gray-100 rounded p-3">
            {players.map((player, index) => (
              <div key={index} className="flex items-center mb-2 last:mb-0">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <span>{player.name} {player.isHost && '👑'}</span>
              </div>
            ))}
          </div>
        </div>

        {isHost && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rounds</label>
              <select
                value={rounds}
                onChange={(e) => setRounds(parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              >
                {[1, 2, 3, 5, 7, 10].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Round Time (seconds)</label>
              <select
                value={roundTime}
                onChange={(e) => setRoundTime(parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              >
                {[30, 45, 60, 90, 120].map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <button
              onClick={() => onStart({ rounds, roundTime, difficulty })}
              disabled={players.length < 2}
              className={`w-full py-2 rounded text-white ${players.length < 2 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
            >
              Start Game
            </button>
          </div>
        )}

        {!isHost && (
          <div className="text-center py-4 text-gray-600">
            Waiting for host to start the game...
          </div>
        )}
      </div>
    </div>
  );
}