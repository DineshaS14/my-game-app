// components/GameBoard.tsx
'use client'
import React, { useState, useEffect, useRef } from "react";

const ROUND_DURATION = 15; // seconds per round
const REQUIRED_CLICKS = 3; // trash bag must be clicked 3 times to clear the round
const MAX_MISSED = 3; // game over after 3 missed payments

const GameBoard: React.FC = () => {
  const [round, setRound] = useState<number>(1);
  const [clickCount, setClickCount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(ROUND_DURATION);
  const [missedPayments, setMissedPayments] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);

  // Use a ref to store the timer ID so we can clear it as needed.
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start or restart the timer every new round (unless the game is over)
  useEffect(() => {
    if (gameOver) return;
    // Clear any existing timer
    if (timerRef.current) clearInterval(timerRef.current);

    // Reset the timer for this round
    setTimeLeft(ROUND_DURATION);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [round, gameOver]);

  // When time runs out, decide if it's a missed payment
  useEffect(() => {
    if (gameOver) return;
    if (timeLeft <= 0) {
      // If the trash bag wasn’t clicked at all during the round, count it as a missed payment
      if (clickCount === 0) {
        setMissedPayments((prev) => {
          const newMissed = prev + 1;
          if (newMissed >= MAX_MISSED) {
            setGameOver(true);
          }
          return newMissed;
        });
      }
      // Proceed to the next round regardless of click count (provided it's not game over)
      setRound((prev) => prev + 1);
      setClickCount(0);
    }
  }, [timeLeft, clickCount, gameOver]);

  // If the trash bag is clicked the required number of times before time is up,
  // end the round early.
  useEffect(() => {
    if (clickCount >= REQUIRED_CLICKS) {
      // Clear the timer since the round is finished
      if (timerRef.current) clearInterval(timerRef.current);
      // Move to the next round
      setRound((prev) => prev + 1);
      setClickCount(0);
    }
  }, [clickCount]);

  const handleTrashClick = () => {
    if (gameOver) return;
    setClickCount((prev) => prev + 1);
  };

  const restartGame = () => {
    setRound(1);
    setClickCount(0);
    setMissedPayments(0);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {gameOver ? (
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Game Over</h1>
          <p className="mb-4">Missed Payments: {missedPayments}</p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={restartGame}
          >
            Restart Game
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 text-center">
            <p>Round: {round}</p>
            <p>Time Left: {timeLeft} seconds</p>
            <p>Clicks: {clickCount}</p>
            <p>Missed Payments: {missedPayments}</p>
          </div>
          {/* Square canvas */}
          <div className="w-96 h-96 bg-white border border-gray-300 flex items-center justify-center relative">
            {/* Trash bag image (located at public/images/trash.png) */}
            <div onClick={handleTrashClick} className="cursor-pointer">
              <img
                src="/images/trash.png"
                alt="Trash Bag"
                className="w-24 h-24"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GameBoard;
