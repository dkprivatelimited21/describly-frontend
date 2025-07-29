// DrawingTools.jsx
const tools = [
  { name: 'pencil', icon: '✏️', sizes: [2, 4, 8] },
  { name: 'marker', icon: '🖍️', sizes: [8, 12, 16] },
  { name: 'spray', icon: '💨', sizes: [10, 20, 30] },
  { name: 'eraser', icon: '🧽', sizes: [10, 20, 30] },
  { name: 'shape', icon: '⭐', types: ['circle', 'square', 'star'] }
];

export default function DrawingTools({ onToolChange }) {
  const [activeTool, setTool] = useState('pencil');
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(4);

  return (
    <div className="toolbar">
      <div className="tools">
        {tools.map(tool => (
          <button
            key={tool.name}
            onClick={() => {
              setTool(tool.name);
              onToolChange({ type: tool.name, size, color });
            }}
            className={activeTool === tool.name ? 'active' : ''}
          >
            {tool.icon} {tool.name}
          </button>
        ))}
      </div>
      
      <input 
        type="color" 
        value={color}
        onChange={(e) => {
          setColor(e.target.value);
          onToolChange({ type: activeTool, size, color: e.target.value });
        }}
      />
      
      <select 
        value={size}
        onChange={(e) => {
          setSize(Number(e.target.value));
          onToolChange({ type: activeTool, size: Number(e.target.value), color });
        }}
      >
        {tools.find(t => t.name === activeTool).sizes?.map(s => (
          <option key={s} value={s}>{s}px</option>
        ))}
      </select>
    </div>
  );
}