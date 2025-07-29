import { useState, useEffect, useRef } from 'react';
import Canvas from './Canvas';
import Chat from './Chat';
import LobbyChat from './LobbyChat';
import PlayerList from './PlayerList';
import './styles/styles.css';

export default function Game({ socket, gameState, playerId, playerName, roomCode, avatar }) {
  const [gameMessages, setGameMessages] = useState([]);
  const [lobbyMessages, setLobbyMessages] = useState([]);
  const [hint, setHint] = useState('');
  const [lastGuessTime, setLastGuessTime] = useState(0);
  const canvasRef = useRef();
  const chatRef = useRef();

  const isDrawer = playerId === gameState?.currentDrawer;
  const isHost = gameState?.host === playerId;
  const playerCount = gameState?.players?.length || 0;

  // Handle all socket events
  useEffect(() => {
    // Game messages
    const handleGameMessage = (message) => {
      setGameMessages(prev => [...prev, {
        ...message,
        timestamp: Date.now()
      }]);
      scrollChatToBottom();
    };

    const handleCorrectGuess = (data) => {
      setGameMessages(prev => [...prev, {
        player: data.playerName,
        text: data.isYou ? data.guess : data.maskedGuess,
        correct: true,
        isYou: data.isYou,
        timestamp: Date.now()
      }]);
      scrollChatToBottom();
    };

    // Lobby messages
    const handleLobbyMessage = (message) => {
      setLobbyMessages(prev => [...prev, {
        ...message,
        timestamp: Date.now()
      }]);
    };

    const handlePlayerUpdate = () => {
      // Force re-render when players change
    };

    socket.on('gameMessage', handleGameMessage);
    socket.on('correctGuess', handleCorrectGuess);
    socket.on('lobbyMessage', handleLobbyMessage);
    socket.on('playerUpdate', handlePlayerUpdate);
    socket.on('hint', setHint);
    socket.on('clearCanvas', () => {
      canvasRef.current?.clearCanvas();
    });

    return () => {
      socket.off('gameMessage', handleGameMessage);
      socket.off('correctGuess', handleCorrectGuess);
      socket.off('lobbyMessage', handleLobbyMessage);
      socket.off('playerUpdate', handlePlayerUpdate);
      socket.off('hint', setHint);
      socket.off('clearCanvas');
    };
  }, [playerId]);

  const scrollChatToBottom = () => {
    setTimeout(() => {
      chatRef.current?.scrollToBottom();
    }, 100);
  };

  const sendGuess = (guess) => {
    const now = Date.now();
    // Spam protection: 1 second between guesses
    if (now - lastGuessTime < 1000) return;
    
    if (guess.trim() && !isDrawer) {
      socket.emit('submitGuess', guess);
      setLastGuessTime(now);
    }
  };

  const sendLobbyMessage = (message) => {
    if (message.trim()) {
      socket.emit('sendLobbyMessage', message);
    }
  };

  const sendDrawing = (data) => {
    if (isDrawer) {
      socket.emit('drawingData', data);
    }
  };

  const clearCanvas = () => {
    if (isDrawer) {
      socket.emit('requestClearCanvas');
    }
  };

  const startGame = () => {
    if (isHost && playerCount >= 2) {
      socket.emit('startGame');
    }
  };

  // Render lobby if game hasn't started
  if (!gameState || gameState?.state === 'lobby') {
    return (
      <div className="lobby-container">
        <div className="lobby-header">
          <h2>Room: {roomCode}</h2>
          {isHost && (
            <button 
              onClick={startGame}
              disabled={playerCount < 2}
              className={`start-button ${playerCount < 2 ? 'disabled' : ''}`}
            >
              Start Game
            </button>
          )}
        </div>
       // Replace the PlayerList usage in Game.jsx with:
<PlayerList 
  players={gameState.players} 
  currentPlayerId={playerId}
  scores={gameState.scores}
/>
        
        <LobbyChat
          ref={chatRef}
          messages={lobbyMessages}
          onSend={sendLobbyMessage}
          playerCount={playerCount}
          avatar={avatar}
        />
      </div>
    );
  }

  // Render game when started
  return (
    <div className="game-container">
      <div className="game-header">
        <div className="game-info">
          <span>Round: {gameState?.currentRound}/{gameState?.rounds}</span>
          <span className="timer">Time: {gameState?.timer}s</span>
          {!isDrawer && hint && (
            <span className="hint">Hint: {hint}</span>
          )}
        </div>
      </div>

      <div className="game-area">
        <div className="canvas-section">
          <Canvas
            ref={canvasRef}
            isDrawer={isDrawer}
            word={isDrawer ? gameState.word : ''}
            onDraw={sendDrawing}
            drawingData={!isDrawer ? gameState.drawing : null}
            avatar={avatar}
            gameState={gameState}
            onClear={clearCanvas}
          />
        </div>
        
        <div className="right-panel">
          <Chat
            ref={chatRef}
            messages={gameMessages}
            isDrawer={isDrawer}
            onSendGuess={sendGuess}
            avatar={avatar}
          />
          
          <PlayerList 
            players={gameState.players} 
            currentPlayerId={playerId}
            scores={gameState.scores}
          />
        </div>
      </div>
    </div>
  );
}