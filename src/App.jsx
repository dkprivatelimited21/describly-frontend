import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Home from './components/Home';
import Lobby from './components/Lobby';
import Game from './components/Game';
import Scoreboard from './components/Scoreboard';
import AvatarSelector from './components/AvatarSelector';

const socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:3000');

function App() {
  const [screen, setScreen] = useState('home');
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [playerId, setPlayerId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [avatar, setAvatar] = useState(null);

  if (!avatar) {
    return <AvatarSelector onSelect={setAvatar} />;
  }

  useEffect(() => {
    socket.on('connect', () => {
      setPlayerId(socket.id);
    });

    socket.on('playerJoined', (playersList) => {
      setPlayers(playersList);
    });

    socket.on('gameStarted', (state) => {
      setGameState(state);
      setScreen('game');
    });

    socket.on('nextRound', (state) => {
      setGameState(state);
    });

    socket.on('gameEnded', (finalScores) => {
      setGameState({ ...gameState, scores: finalScores });
      setScreen('scoreboard');
    });

    return () => {
      socket.off('connect');
      socket.off('playerJoined');
      socket.off('gameStarted');
      socket.off('nextRound');
      socket.off('gameEnded');
    };
  }, []);

  const createGame = (name) => {
    setPlayerName(name);
    socket.emit('createRoom', name, (response) => {
      setRoomCode(response.roomCode);
      setIsHost(true);
      setScreen('lobby');
    });
  };

  const joinGame = (code, name) => {
    setPlayerName(name);
    socket.emit('joinRoom', code, name, (response) => {
      if (response.error) {
        alert(response.error);
        return;
      }
      setRoomCode(code);
      setPlayers(response.players);
      setScreen('lobby');
    });
  };

  const startGame = (settings) => {
    socket.emit('startGame', settings);
  };

  const playAgain = () => {
    socket.emit('playAgain', roomCode);
    setScreen('lobby');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {screen === 'home' && (
        <Home onCreate={createGame} onJoin={joinGame} />
      )}
      {screen === 'lobby' && (
        <Lobby
          players={players}
          isHost={isHost}
          roomCode={roomCode}
          onStart={startGame}
        />
      )}
      {screen === 'game' && gameState && (
        <Game
          socket={socket}
          gameState={gameState}
          playerId={playerId}
          playerName={playerName}
          roomCode={roomCode}
        />
      )}
      {screen === 'scoreboard' && gameState && (
        <Scoreboard
          scores={gameState.scores}
          players={players}
          isHost={isHost}
          onPlayAgain={playAgain}
        />
      )}
    </div>
  );
}

export default App;