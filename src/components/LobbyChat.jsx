// LobbyChat.jsx
export default function LobbyChat({ messages, onSend, isHost, playerCount }) {
  const [message, setMessage] = useState('');
  const [lastSent, setLastSent] = useState(0);
  
  const handleSend = () => {
    if (!message.trim() || Date.now() - lastSent < 1000) return; // Spam protection
    
    onSend(message);
    setMessage('');
    setLastSent(Date.now());
  };

  return (
    <div className="lobby-chat">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.system ? 'system' : ''}`}>
            {msg.player && <span className="player">{msg.player}:</span>}
            {msg.text}
          </div>
        ))}
      </div>
      
      <div className="input-area">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={playerCount < 2 ? 'Waiting for more players...' : 'Chat here!'}
          disabled={playerCount < 2}
        />
        <button onClick={handleSend} disabled={playerCount < 2}>
          Send
        </button>
      </div>
    </div>
  );
}