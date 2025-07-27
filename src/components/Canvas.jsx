import React, { useState, useEffect } from 'react';

import { forwardRef, useEffect, useImperativeHandle } from 'react';

const Canvas = forwardRef(({ isDrawer, word, onDraw, drawingData }, ref) => {
  const canvasRef = useRef();
  const isDrawingRef = useRef(false);
  const prevPosRef = useRef({ x: 0, y: 0 });

  useImperativeHandle(ref, () => ({
    clearCanvas: () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth - 4;
      canvas.height = Math.min(container.clientWidth * 0.75, 500);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize drawing tools
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

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
      };

      const draw = (e) => {
        if (!isDrawingRef.current) return;
        const pos = getPosition(e);
        
        ctx.beginPath();
        ctx.moveTo(prevPosRef.current.x, prevPosRef.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        
        // Send drawing data
        onDraw({
          type: 'draw',
          from: prevPosRef.current,
          to: pos,
          color: ctx.strokeStyle,
          width: ctx.lineWidth
        });

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
  }, [isDrawer, drawingData]);

  const drawReceivedData = (data) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getBoundingClientRect ? canvas.getContext('2d') : null;
    if (!ctx) return;

    if (data.type === 'clear') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    ctx.strokeStyle = data.color || '#000';
    ctx.lineWidth = data.width || 4;
    ctx.beginPath();
    ctx.moveTo(data.from.x, data.from.y);
    ctx.lineTo(data.to.x, data.to.y);
    ctx.stroke();
  };

  return (
    <div className="relative">
      {isDrawer && (
        <div className="absolute top-0 left-0 right-0 bg-blue-100 p-2 text-center font-bold">
          Draw: {word}
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full bg-white border border-gray-300 touch-none"
      />
      {isDrawer && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => {
              const canvas = canvasRef.current;
              const ctx = canvas.getContext('2d');
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              onDraw({ type: 'clear' });
            }}
            className="px-3 py-1 bg-red-500 text-white rounded"
          >
            Clear
          </button>
          <select
            onChange={(e) => {
              const ctx = canvasRef.current.getContext('2d');
              ctx.strokeStyle = e.target.value;
            }}
            className="border rounded"
          >
            <option value="#000000">Black</option>
            <option value="#FF0000">Red</option>
            <option value="#00FF00">Green</option>
            <option value="#0000FF">Blue</option>
            <option value="#FFFF00">Yellow</option>
          </select>
          <select
            onChange={(e) => {
              const ctx = canvasRef.current.getContext('2d');
              ctx.lineWidth = parseInt(e.target.value);
            }}
            className="border rounded"
          >
            <option value="2">Thin</option>
            <option value="4">Medium</option>
            <option value="8">Thick</option>
            <option value="12">Very Thick</option>
          </select>
        </div>
      )}
    </div>
  );
});

export default Canvas;