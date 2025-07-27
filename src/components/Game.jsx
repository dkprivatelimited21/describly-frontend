import { useState, useEffect, useRef } from 'react';
import Canvas from './Canvas';
import Chat from './Chat';

export default function Game({ socket, gameState, playerId, playerName, roomCode }) {
  const [messages, setMessages] = useState([]);
  const [hint, setHint] = useState('');
  const isDrawer = playerId === gameState.currentDrawer;
  const canvasRef = useRef();

  useEffect(() => {
    const handleMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    const handleCorrectGuess = (data) => {
      setMessages(prev => [...prev, {
        player: data.player,
        text: data.guess,
        correct: true
      }]);
    };

    const handleHint = (hintText) => {
      setHint(hintText);
    };

    socket.on('message', handleMessage);
    socket.on('correctGuess', handleCorrectGuess);
    socket.on('hint', handleHint);

    return () => {
      socket.off('message', handleMessage);
      socket.off('correctGuess', handleCorrectGuess);
      socket.off('hint', handleHint);
    };
  }, []);

  const sendGuess = (guess) => {
    socket.emit('guess', guess);
  };

  const sendDrawing = (data) => {
    socket.emit('drawing', data);
  };

  return (
    <div className="flex flex-col min-h-screen p-2 md:p-4 bg-gray-100">
      <div className="flex flex-col md:flex-row gap-4 flex-1">
        {/* Canvas Area */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-2 md:p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold">
              {isDrawer ? 'You are drawing' : `${gameState.currentDrawerName} is drawing`}
            </h2>
            <div className="bg-blue-500 text-white px-3 py-1 rounded-full">
              {gameState.timer}s
            </div>
          </div>

          {hint && !isDrawer && (
            <div className="bg-yellow-100 text-yellow-800 p-2 rounded mb-2">
              Hint: {hint}
            </div>
          )}

          <Canvas
            ref={canvasRef}
            isDrawer={isDrawer}
            word={isDrawer ? gameState.word : ''}
            onDraw={sendDrawing}
            drawingData={!isDrawer ? gameState.drawing : null}
          />
        </div>

        {/* Chat Area */}
        <div className="w-full md:w-80 bg-white rounded-lg shadow-md p-2 md:p-4">
          <Chat
            messages={messages}
            isDrawer={isDrawer}
            onSendGuess={sendGuess}
          />
        </div>
      </div>
    </div>
  );
}