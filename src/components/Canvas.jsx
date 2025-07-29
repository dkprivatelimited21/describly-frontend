import { forwardRef, useEffect, useRef, useState } from 'react';
import DrawingTools from './DrawingTools';
import './styles/canvas.css';

const Canvas = forwardRef(({ 
  isDrawer, 
  word, 
  onDraw, 
  drawingData, 
  avatar,
  gameState
}, ref) => {
  const canvasRef = useRef();
  const isDrawingRef = useRef(false);
  const prevPosRef = useRef({ x: 0, y: 0 });
  const [toolConfig, setToolConfig] = useState({
    color: '#000000',
    size: 4,
    type: 'pencil',
    opacity: 1
  });

  // Expose canvas methods to parent
  useImperativeHandle(ref, () => ({
    clearCanvas: () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onDraw({ type: 'clear' });
    },
    getCanvasData: () => {
      return canvasRef.current.toDataURL();
    }
  }));

  // Initialize canvas and event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth;
      canvas.height = Math.min(container.clientWidth * 0.75, 500);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Draw existing data if not drawer
    if (!isDrawer && drawingData) {
      drawReceivedData(drawingData);
    }

    // Set up drawing event listeners if drawer
    if (isDrawer) {
      const startDrawing = (e) => {
        isDrawingRef.current = true;
        const pos = getPosition(e);
        prevPosRef.current = pos;
        
        // For single-point tools (like stamps)
        if (toolConfig.type === 'stamp') {
          drawStamp(pos);
        }
      };

      const draw = (e) => {
        if (!isDrawingRef.current) return;
        const pos = getPosition(e);
        
        switch (toolConfig.type) {
          case 'spray':
            drawSpray(pos);
            break;
          default:
            drawLine(pos);
        }
        
        prevPosRef.current = pos;
      };

      const stopDrawing = () => {
        isDrawingRef.current = false;
      };

      const getPosition = (e) => {
        const rect = canvas.getBoundingClientRect();
        return {
          x: (e.clientX || e.touches[0].clientX) - rect.left,
          y: (e.clientY || e.touches[0].clientY) - rect.top
        };
      };

      // Mouse events
      canvas.addEventListener('mousedown', startDrawing);
      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('mouseup', stopDrawing);
      canvas.addEventListener('mouseout', stopDrawing);

      // Touch events for mobile
      canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrawing(e);
      });
      canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        draw(e);
      });
      canvas.addEventListener('touchend', stopDrawing);

      return () => {
        canvas.removeEventListener('mousedown', startDrawing);
        canvas.removeEventListener('mousemove', draw);
        canvas.removeEventListener('mouseup', stopDrawing);
        canvas.removeEventListener('mouseout', stopDrawing);
        canvas.removeEventListener('touchstart', startDrawing);
        canvas.removeEventListener('touchmove', draw);
        canvas.removeEventListener('touchend', stopDrawing);
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, [isDrawer, drawingData, toolConfig.type]);

  // Drawing functions
  const drawLine = (pos) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = toolConfig.color;
    ctx.lineWidth = toolConfig.size;
    ctx.lineCap = 'round';
    ctx.globalAlpha = toolConfig.opacity;
    
    if (toolConfig.type === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.beginPath();
    ctx.moveTo(prevPosRef.current.x, prevPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    onDraw({
      type: 'draw',
      from: prevPosRef.current,
      to: pos,
      color: toolConfig.color,
      width: toolConfig.size,
      tool: toolConfig.type,
      opacity: toolConfig.opacity
    });
  };

  const drawSpray = (pos) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = toolConfig.color;
    ctx.globalAlpha = toolConfig.opacity * 0.3;
    
    const radius = toolConfig.size * 2;
    const density = toolConfig.size * 5;
    
    for (let i = 0; i < density; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      const x = pos.x + Math.cos(angle) * distance;
      const y = pos.y + Math.sin(angle) * distance;
      
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    onDraw({
      type: 'spray',
      pos,
      color: toolConfig.color,
      size: toolConfig.size,
      opacity: toolConfig.opacity
    });
  };

  const drawStamp = (pos) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.font = `${toolConfig.size * 5}px Arial`;
    ctx.fillStyle = toolConfig.color;
    ctx.globalAlpha = toolConfig.opacity;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    let stamp = '★';
    if (toolConfig.stampShape) {
      stamp = toolConfig.stampShape;
    }
    
    ctx.fillText(stamp, pos.x, pos.y);

    onDraw({
      type: 'stamp',
      pos,
      shape: stamp,
      color: toolConfig.color,
      size: toolConfig.size,
      opacity: toolConfig.opacity
    });
  };

  const drawReceivedData = (data) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (data.type === 'clear') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    ctx.globalAlpha = data.opacity || 1;
    
    switch (data.type) {
      case 'draw':
        ctx.strokeStyle = data.color || '#000';
        ctx.lineWidth = data.width || 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(data.from.x, data.from.y);
        ctx.lineTo(data.to.x, data.to.y);
        ctx.stroke();
        break;
        
      case 'spray':
        ctx.fillStyle = data.color;
        for (let i = 0; i < (data.size * 5); i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * data.size * 2;
          const x = data.pos.x + Math.cos(angle) * distance;
          const y = data.pos.y + Math.sin(angle) * distance;
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
        
      case 'stamp':
        ctx.font = `${data.size * 5}px Arial`;
        ctx.fillStyle = data.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(data.shape, data.pos.x, data.pos.y);
        break;
    }
    
    ctx.globalAlpha = 1;
  };

  return (
    <div className="canvas-container">
      {isDrawer ? (
        <div className="drawer-header">
          <div className="avatar-badge">
            <span className="avatar" style={{ backgroundColor: avatar?.color }}>
              {avatar?.icon || '👤'}
            </span>
            <span className="word-display">Draw: {word}</span>
          </div>
          <DrawingTools 
            onToolChange={setToolConfig}
            currentTool={toolConfig}
          />
        </div>
      ) : (
        gameState?.currentDrawerAvatar && (
          <div className="drawer-header">
            <span className="avatar" style={{ backgroundColor: gameState.currentDrawerColor }}>
              {gameState.currentDrawerAvatar}
            </span>
            <span>{gameState.currentDrawerName} is drawing</span>
          </div>
        )
      )}

      <canvas
        ref={canvasRef}
        className="drawing-canvas"
      />
    </div>
  );
});

export default Canvas;