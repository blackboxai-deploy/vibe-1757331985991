'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameState,
  DIRECTIONS,
  BOARD_SIZE,
  CELL_SIZE,
  getInitialGameState,
  moveSnake,
  changeDirection,
  getGameSpeed,
  saveHighScore,
  getHighScore,
} from '@/lib/snake-game';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SnakeGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(getInitialGameState());
  const [highScore, setHighScore] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load high score on component mount
  useEffect(() => {
    setHighScore(getHighScore());
  }, []);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#4a1515';
    ctx.lineWidth = 1;
    for (let i = 0; i <= BOARD_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, BOARD_SIZE * CELL_SIZE);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(BOARD_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw snake
    gameState.snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#dc2626' : '#991b1b';
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    });

    // Draw food
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(
      gameState.food.x * CELL_SIZE + 1,
      gameState.food.y * CELL_SIZE + 1,
      CELL_SIZE - 2,
      CELL_SIZE - 2
    );
  }, [gameState]);

  const gameLoop = useCallback(() => {
    setGameState(prevState => {
      const newState = moveSnake(prevState);
      if (newState.gameOver && !prevState.gameOver) {
        saveHighScore(newState.score);
        setHighScore(getHighScore());
      }
      return newState;
    });
  }, []);

  useEffect(() => {
    if (gameStarted && !gameState.gameOver && !gameState.paused) {
      gameLoopRef.current = setTimeout(() => {
        gameLoop();
      }, getGameSpeed(gameState.score));
    }

    return () => {
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current);
      }
    };
  }, [gameState, gameStarted, gameLoop]);

  useEffect(() => {
    drawGame();
  }, [drawGame]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!gameStarted) return;

      const { key } = event;
      let newDirection = gameState.direction;

      switch (key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          newDirection = DIRECTIONS.UP;
          break;
        case 'arrowdown':
        case 's':
          newDirection = DIRECTIONS.DOWN;
          break;
        case 'arrowleft':
        case 'a':
          newDirection = DIRECTIONS.LEFT;
          break;
        case 'arrowright':
        case 'd':
          newDirection = DIRECTIONS.RIGHT;
          break;
        case ' ':
          event.preventDefault();
          setGameState(prev => ({ ...prev, paused: !prev.paused }));
          return;
        case 'enter':
          if (gameState.gameOver) {
            restartGame();
          }
          return;
      }

      if (newDirection !== gameState.direction) {
        setGameState(prev => ({
          ...prev,
          direction: changeDirection(prev.direction, newDirection),
        }));
      }
    },
    [gameState.direction, gameState.gameOver, gameStarted]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  const startGame = () => {
    setGameState(getInitialGameState());
    setGameStarted(true);
  };

  const restartGame = () => {
    setGameState(getInitialGameState());
    setGameStarted(true);
  };

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, paused: !prev.paused }));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Game Board */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <canvas
              ref={canvasRef}
              width={BOARD_SIZE * CELL_SIZE}
              height={BOARD_SIZE * CELL_SIZE}
              className="border border-gray-600 rounded-lg"
            />
          </CardContent>
        </Card>

        {/* Game Info Panel */}
        <div className="flex flex-col gap-4 min-w-[250px]">
          {/* Score Display */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-center">Snake Game</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-green-400 text-2xl font-bold">
                  Score: {gameState.score}
                </div>
                <div className="text-yellow-400 text-lg">
                  High Score: {highScore}
                </div>
              </div>

              {/* Game Status */}
              {!gameStarted && (
                <div className="text-center">
                  <p className="text-gray-300 mb-4">Press Start to begin!</p>
                  <Button onClick={startGame} className="w-full">
                    Start Game
                  </Button>
                </div>
              )}

              {gameStarted && gameState.paused && !gameState.gameOver && (
                <div className="text-center">
                  <p className="text-yellow-400 text-lg font-bold mb-4">PAUSED</p>
                  <Button onClick={pauseGame} className="w-full">
                    Resume
                  </Button>
                </div>
              )}

              {gameState.gameOver && (
                <div className="text-center">
                  <p className="text-red-400 text-lg font-bold mb-4">GAME OVER</p>
                  <Button onClick={restartGame} className="w-full">
                    Play Again
                  </Button>
                </div>
              )}

              {gameStarted && !gameState.paused && !gameState.gameOver && (
                <div className="text-center">
                  <Button onClick={pauseGame} variant="outline" className="w-full">
                    Pause Game
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Controls Info */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-center text-lg">Controls</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-300 space-y-2">
              <div className="flex justify-between">
                <span>Move:</span>
                <span>Arrow Keys or WASD</span>
              </div>
              <div className="flex justify-between">
                <span>Pause:</span>
                <span>Spacebar</span>
              </div>
              <div className="flex justify-between">
                <span>Restart:</span>
                <span>Enter (when game over)</span>
              </div>
            </CardContent>
          </Card>

          {/* Game Rules */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-center text-lg">How to Play</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-300 space-y-2">
              <p>• Eat red food to grow and score points</p>
              <p>• Avoid hitting walls or yourself</p>
              <p>• Game speed increases with score</p>
              <p>• Try to beat your high score!</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;