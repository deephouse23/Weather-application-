/**
 * 16-Bit Weather Platform - v1.0.0
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * Use Limitation: 5 users
 * See LICENSE file for full terms
 * 
 * BETA SOFTWARE NOTICE:
 * This software is in active development. Features may change.
 * Report issues: https://github.com/deephouse23/Weather-application-/issues
 */

import React, { useEffect, useRef, useState } from 'react';

interface HighScore {
  score: number;
  date: string;
}

interface SnakeSegment {
  x: number;
  y: number;
}

const SnakeGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRunningRef = useRef(true);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [showHighScores, setShowHighScores] = useState(true);
  const [newRecord, setNewRecord] = useState(false);

  // Game constants
  const gridSize = 20;
  const tileCount = 20;

  // Load high scores from localStorage
  const loadHighScores = (): HighScore[] => {
    if (typeof window !== 'undefined') {
      const scores = localStorage.getItem('snakeHighScores');
      return scores ? JSON.parse(scores) : [];
    }
    return [];
  };

  // Save high scores
  const saveHighScores = (scores: HighScore[]): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('snakeHighScores', JSON.stringify(scores));
    }
  };

  // Add high score
  const addHighScore = (newScore: number): boolean => {
    const scores = loadHighScores();
    const timestamp = new Date().toLocaleDateString();
    scores.push({ score: newScore, date: timestamp });
    scores.sort((a: HighScore, b: HighScore) => b.score - a.score);
    scores.splice(5); // Keep only top 5
    saveHighScores(scores);
    setHighScores(scores);
    return scores[0].score === newScore && scores.filter((s: HighScore) => s.score === newScore).length === 1;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Game state
    const snake: SnakeSegment[] = [{x: 10, y: 10}];
    let food: SnakeSegment = { x: 15, y: 15 };
    let dx = 0;
    let dy = 0;
    let gameRunning = true;

    // Generate random food position
    const randomFood = () => {
      food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
      };
      
      // Make sure food doesn't spawn on snake
      while (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        food = {
          x: Math.floor(Math.random() * tileCount),
          y: Math.floor(Math.random() * tileCount)
        };
      }
    };

    // Draw game elements
    const draw = () => {
      // Clear canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw subtle grid
      ctx.strokeStyle = '#003300';
      ctx.lineWidth = 1;
      for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
      }

      // Draw snake with glow effect
      snake.forEach((segment, index) => {
        ctx.shadowColor = '#00ff41';
        ctx.shadowBlur = 10;
        ctx.fillStyle = index === 0 ? '#40ff71' : '#00ff41';
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        ctx.shadowBlur = 0;
      });

      // Draw food with pulsing effect
      ctx.shadowColor = '#ff0040';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#ff0040';
      ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
      ctx.shadowBlur = 0;
    };

    // Update game state
    const update = () => {
      if (!gameRunningRef.current) return;

      const head = {x: snake[0].x + dx, y: snake[0].y + dy};

      // Check wall collision
      if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        handleGameOver();
        return;
      }

      // Check self collision
      if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        handleGameOver();
        return;
      }

      snake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        randomFood();
      } else {
        snake.pop();
      }
    };

    const handleGameOver = () => {
      gameRunning = false;
      gameRunningRef.current = false;
      setGameOver(true);
      setFinalScore(score);
      const isNewRecord = addHighScore(score);
      setNewRecord(isNewRecord && score > 0);
    };

    // Handle keyboard input
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameRunningRef.current) return;

      const key = e.key.toLowerCase();
      
      if ((key === 'arrowup' || key === 'w') && dy === 0) {
        dx = 0;
        dy = -1;
      } else if ((key === 'arrowdown' || key === 's') && dy === 0) {
        dx = 0;
        dy = 1;
      } else if ((key === 'arrowleft' || key === 'a') && dx === 0) {
        dx = -1;
        dy = 0;
      } else if ((key === 'arrowright' || key === 'd') && dx === 0) {
        dx = 1;
        dy = 0;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    // Game loop
    const gameLoop = () => {
      update();
      draw();
    };

    // Initialize
    randomFood();
    setHighScores(loadHighScores());
    const interval = setInterval(gameLoop, 100);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [score]);

  const restartGame = () => {
    setScore(0);
    setGameOver(false);
    setNewRecord(false);
    gameRunningRef.current = true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-black/80 p-6 rounded-xl border-4 border-green-400 shadow-[0_0_20px_#00ff41]">
        <h1 className="text-4xl font-bold text-green-400 text-center mb-6 font-mono uppercase tracking-wider" style={{ textShadow: '0 0 10px #00ff41' }}>
          RETRO SNAKE
        </h1>
        
        <div className="text-2xl text-green-400 text-center mb-4 font-mono font-bold">
          Score: <span>{score}</span>
        </div>
        
        <canvas 
          ref={canvasRef}
          width={400}
          height={400}
          className="border-2 border-green-400 bg-black block mx-auto shadow-[0_0_15px_rgba(0,255,65,0.5)]"
        />
        
        <div className="text-green-400 text-center mt-4 font-mono text-lg">
          Use WASD or Arrow Keys to move
        </div>
        
      </div>
    </div>
  );
};

export default SnakeGame; 