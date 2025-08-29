"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Trophy, Zap } from 'lucide-react';

type Position = {
  x: number;
  y: number;
};

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 15, y: 15 };
const INITIAL_SPEED = 150;

export default function PixelPython() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(INITIAL_FOOD);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [level, setLevel] = useState(1);

  const generateFood = useCallback(() => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection('RIGHT');
    setGameRunning(false);
    setGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setLevel(1);
  };

  const startGame = () => {
    if (gameOver) {
      resetGame();
    }
    setGameRunning(true);
  };

  const pauseGame = () => {
    setGameRunning(false);
  };

  const moveSnake = useCallback(() => {
    if (!gameRunning || gameOver) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };

      switch (direction) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true);
        setGameRunning(false);
        if (score > highScore) {
          setHighScore(score);
        }
        return currentSnake;
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        setGameRunning(false);
        if (score > highScore) {
          setHighScore(score);
        }
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        setFood(generateFood());
        
        // Increase speed and level every 5 points
        if ((score + 10) % 50 === 0) {
          setLevel(prev => prev + 1);
          setSpeed(prev => Math.max(prev - 10, 80));
        }
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameRunning, gameOver, score, highScore, generateFood]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameRunning) return;
      
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
        case ' ':
          e.preventDefault();
          gameRunning ? pauseGame() : startGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameRunning]);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, speed);
    return () => clearInterval(gameInterval);
  }, [moveSnake, speed]);

  const renderGrid = () => {
    const grid = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
        const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y);
        const isFood = food.x === x && food.y === y;
        
        let cellClass = 'w-4 h-4 border border-gray-800/20';
        
        if (isSnakeHead) {
          cellClass += ' bg-emerald-500 rounded-sm shadow-sm';
        } else if (isSnakeBody) {
          cellClass += ' bg-emerald-400 rounded-sm';
        } else if (isFood) {
          cellClass += ' bg-red-500 rounded-full shadow-sm animate-pulse';
        } else {
          cellClass += ' bg-gray-100';
        }
        
        grid.push(
          <div
            key={`${x}-${y}`}
            className={cellClass}
          />
        );
      }
    }
    return grid;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            🐍 PixelPython
          </h1>
          <p className="text-slate-300 text-lg">
            O clássico jogo da cobra reimaginado com estilo moderno
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  <div 
                    className="grid gap-0 p-4 bg-gray-50 rounded-lg shadow-inner border-2 border-gray-200"
                    style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
                  >
                    {renderGrid()}
                  </div>
                </div>
                
                {/* Game Over Overlay */}
                {gameOver && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <div className="text-center text-white">
                      <h2 className="text-4xl font-bold mb-4">💀 Game Over!</h2>
                      <p className="text-xl mb-6">Pontuação Final: {score}</p>
                      <Button onClick={startGame} size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Jogar Novamente
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Controls & Stats */}
          <div className="space-y-6">
            {/* Stats */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Pontos:</span>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {score}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Recorde:</span>
                  <Badge variant="outline" className="text-lg px-3 py-1 border-yellow-400 text-yellow-400">
                    {highScore}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Nível:</span>
                  <Badge className="text-lg px-3 py-1 bg-purple-600">
                    {level}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Tamanho:</span>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {snake.length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Controls */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-400" />
                  Controles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  {!gameRunning ? (
                    <Button 
                      onClick={startGame} 
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      size="lg"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {gameOver ? 'Reiniciar' : 'Iniciar'}
                    </Button>
                  ) : (
                    <Button 
                      onClick={pauseGame} 
                      variant="outline" 
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                      size="lg"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Pausar
                    </Button>
                  )}
                  <Button 
                    onClick={resetGame} 
                    variant="outline" 
                    className="border-white/20 text-white hover:bg-white/10"
                    size="lg"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="text-sm text-slate-300 space-y-2">
                  <p><kbd className="px-2 py-1 bg-white/20 rounded text-xs">↑↓←→</kbd> Mover</p>
                  <p><kbd className="px-2 py-1 bg-white/20 rounded text-xs">Espaço</kbd> Pausar/Continuar</p>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-sm">Como Jogar</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300 space-y-2">
                <p>🎯 Colete a comida vermelha para crescer</p>
                <p>⚡ A velocidade aumenta a cada nível</p>
                <p>💥 Evite bater nas paredes ou em si mesmo</p>
                <p>🏆 Tente bater seu recorde pessoal!</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}