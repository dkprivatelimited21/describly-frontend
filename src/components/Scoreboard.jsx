import React, { useState, useEffect } from 'react';

export default function Scoreboard({ scores, players, isHost, onPlayAgain }) {
  const sortedScores = [...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Game Results</h2>
        
        <div className="mb-6">
          <h3 className="font-medium mb-3 text-center">Final Scores</h3>
          <div className="space-y-2">
            {sortedScores.map((player, index) => (
              <div key={player.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  <span className="font-medium mr-2">{index + 1}.</span>
                  <span>{player.name} {player.isHost && '👑'}</span>
                </div>
                <span className="font-bold">{scores[player.id] || 0} points</span>
              </div>
            ))}
          </div>
        </div>

        {isHost && (
          <button
            onClick={onPlayAgain}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          >
            Play Again
          </button>
        )}

        {!isHost && (
          <div className="text-center py-4 text-gray-600">
            Waiting for host to start a new game...
          </div>
        )}
      </div>
    </div>
  );
}