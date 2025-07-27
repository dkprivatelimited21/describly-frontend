import { useState, useEffect, useRef } from 'react';

export default function Chat({ messages, isDrawer, onSendGuess }) {
  const [guess, setGuess] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!guess.trim()) return;
    onSendGuess(guess);
    setGuess('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto mb-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-2 p-2 rounded ${msg.correct ? 'bg-green-100' : 'bg-gray-100'}`}
          >
            <div className="font-semibold">{msg.player}:</div>
            <div>
              {msg.text} {msg.correct && '🎉'}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {!isDrawer && (
        <div className="flex gap-2">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your guess..."
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-3 rounded hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}