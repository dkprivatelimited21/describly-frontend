import React from 'react';
import './styles/styles.css';

export default function PlayerList({ players, currentPlayerId, scores }) {
  return (
    <div className="player-list-container">
      <h3>Players ({players.length})</h3>
      <ul className="player-list">
        {players.map(player => (
          <li key={player.id} className={`player-item ${player.id === currentPlayerId ? 'you' : ''}`}>
            <div className="player-avatar" style={{ backgroundColor: player.avatar?.color || '#ccc' }}>
              {player.avatar?.icon || '👤'}
            </div>
            <div className="player-info">
              <span className="player-name">
                {player.name}
                {player.id === currentPlayerId && ' (You)'}
                {player.isHost && ' 👑'}
              </span>
              {scores && (
                <span className="player-score">
                  Score: {scores[player.id] || 0}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}