/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useCallback } from "react";

const GRID_SIZE = 30;
const CELL_SIZE = 20;
const INITIAL_SNAKE: Point[] = [
  { y: 0, x: 2 },
  { y: 0, x: 1 },
  { y: 0, x: 0 },
];
const INITIAL_FOOD: Point = { x: 5, y: 5 };
const INITIAL_SPEED = 50;
const MIN_SPEED = 50;
const MAX_SPEED = 500;

type Point = {
  x: number;
  y: number;
};

type Direction = "up" | "down" | "left" | "right";

export default function SnakeGrid() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>(INITIAL_FOOD);
  const [direction, setDirection] = useState<Direction>("right");
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(INITIAL_SPEED);
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  const generateFood = useCallback(() => {
    let newFood: Point;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (
      snake.some((part) => part.x === newFood.x && part.y === newFood.y)
    );
    setFood(newFood);
  }, [snake]);

  const moveSnake = useCallback(() => {
    if (gameOver || !gameStarted) return;

    setSnake((prevSnake: Point[]): Point[] => {
      const head = { ...prevSnake[0] };

      switch (direction) {
        case "up":
          head.y -= 1;
          break;
        case "down":
          head.y += 1;
          break;
        case "left":
          head.x -= 1;
          break;
        case "right":
          head.x += 1;
          break;
      }

      if (
        head.x < 0 ||
        head.x >= GRID_SIZE ||
        head.y < 0 ||
        head.y >= GRID_SIZE
      ) {
        setGameOver(true);
        return prevSnake;
      }

      if (
        prevSnake.some(
          (part, index) => index !== 0 && part.x === head.x && part.y === head.y
        )
      ) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];
      let ateFood = false;

      if (head.x === food.x && head.y === food.y) {
        ateFood = true;
        setScore((prev) => prev + 1);
        generateFood();
      }

      if (!ateFood) {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, gameStarted, generateFood]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (gameOver || !gameStarted) return;

      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
      ) {
        event.preventDefault();
      }

      switch (event.key) {
        case "ArrowUp":
          if (direction !== "down") setDirection("up");
          break;
        case "ArrowDown":
          if (direction !== "up") setDirection("down");
          break;
        case "ArrowLeft":
          if (direction !== "right") setDirection("left");
          break;
        case "ArrowRight":
          if (direction !== "left") setDirection("right");
          break;
      }
    },
    [direction, gameOver, gameStarted]
  );

  useEffect(() => {
    if (!gameStarted) return;

    const interval = setInterval(moveSnake, speed);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [moveSnake, handleKeyDown, speed, gameStarted]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection("right");
    setGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setGameStarted(false);
  };

  const startGame = () => {
    setGameStarted(true);
  };

  const increaseSpeed = () => {
    setSpeed((prev) => Math.max(MIN_SPEED, prev - 50));
  };

  const decreaseSpeed = () => {
    setSpeed((prev) => Math.min(MAX_SPEED, prev + 50));
  };

  const movesPerSecond = (1000 / speed).toFixed(1);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex justify-between w-[600px]">
        <h1 className="text-2xl font-bold">Snake Game</h1>
        <p className="text-xl">Score: {score}</p>
      </div>
      <div className="flex flex-col gap-2 w-[600px]">
        <p className="text-lg">Speed: {movesPerSecond} moves/sec</p>
        <div className="flex gap-2">
          {!gameStarted && !gameOver && (
            <button
              onClick={startGame}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 cursor-pointer"
            >
              Start Game
            </button>
          )}
          <button
            onClick={increaseSpeed}
            disabled={speed <= MIN_SPEED || !gameStarted}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 cursor-pointer"
          >
            Faster
          </button>
          <button
            onClick={decreaseSpeed}
            disabled={speed >= MAX_SPEED || !gameStarted}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 cursor-pointer"
          >
            Slower
          </button>
        </div>
        <input
          type="range"
          min={MIN_SPEED}
          max={MAX_SPEED}
          step={10}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          disabled={!gameStarted}
          className="w-full cursor-pointer"
        />
      </div>
      <div
        className="grid grid-cols-30 grid-rows-30 border border-black w-[600px] h-[600px] relative focus:outline-none "
        tabIndex={0}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const isSnake = snake.some(
            (snakePart) => snakePart.x === x && snakePart.y === y
          );
          const isFood = food.x === x && food.y === y;

          return (
            <div
              key={i}
              className={`w-5 h-5 border border-gray-400 aspect-square ${
                isSnake ? "bg-green-500" : isFood ? "bg-red-500" : "bg-white"
              }`}
            ></div>
          );
        })}
        {gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg text-center">
              <h2 className="text-black text-2xl font-bold mb-4">Game Over</h2>
              <p className=" text-black text-xl mb-4">Score: {score}</p>
              <button
                onClick={resetGame}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
              >
                Restart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
