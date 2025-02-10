'use client'
import React, { useState, useEffect, useRef } from "react";

interface TrashObject {
  id: number;
  totalClicks: number; // accumulated taps across rounds
  roundClicks: number; // taps during the current round (reset each round)
  busted: boolean;
  top: number; // vertical position (percentage)
  left: number; // horizontal position (percentage)
}

const ROUND_DURATION = 12; // seconds per round
const END_ROUND_DELAY = 2000; // ms delay before next round starts
const REQUIRED_CLICKS = 3; // taps needed to clear an object
const BUSTED_THRESHOLD = 10; // game over if total busted > 10

const GameBoard: React.FC = () => {
  // Game states
  const [started, setStarted] = useState<boolean>(false);
  const [round, setRound] = useState<number>(1);
  const [objects, setObjects] = useState<TrashObject[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(ROUND_DURATION);
  const [totalBusted, setTotalBusted] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [roundEnded, setRoundEnded] = useState<boolean>(false);
  // For unique IDs for new objects
  const [nextId, setNextId] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper: generate a random percentage (we use 0–75% so the image stays within the 100% canvas)
  const getRandomPosition = () => Math.random() * 75;

  // Start (or restart) a round:
  // • Reset the round timer.
  // • For all objects already in play (carryover from previous rounds) that are not busted,
  //   reset roundClicks and reassign positions.
  // • Add new objects equal to the current round number.
  const startRound = () => {
    setTimeLeft(ROUND_DURATION);
    // For carryover objects that are not busted, reset roundClicks and randomize positions.
    setObjects((prev) =>
      prev.map((obj) =>
        obj.busted
          ? obj
          : { ...obj, roundClicks: 0, top: getRandomPosition(), left: getRandomPosition() }
      )
    );

    // Create new objects for this round.
    const newObjects: TrashObject[] = [];
    for (let i = 0; i < round; i++) {
      newObjects.push({
        id: nextId + i,
        totalClicks: 0,
        roundClicks: 0,
        busted: false,
        top: getRandomPosition(),
        left: getRandomPosition(),
      });
    }
    setNextId((prev) => prev + round);
    setObjects((prev) => [...prev, ...newObjects]);

    // Start (or restart) the round timer.
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
  };

  // End the round: process each object to see if it was tapped this round.
  // • Any object with roundClicks === 0 (i.e. not tapped at all during the round)
  //   is marked as busted.
  // • Busted objects are kept on the canvas.
  // • A vibrant overlay message is shown before moving on.
  const endRound = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    // Process objects: mark those that received zero taps this round as busted.
    let bustedThisRound = 0;
    setObjects((prev) =>
      prev.map((obj) => {
        if (!obj.busted && obj.roundClicks === 0) {
          bustedThisRound++;
          return { ...obj, busted: true };
        }
        return obj;
      })
    );

    // Update the total busted count.
    setTotalBusted((prev) => prev + bustedThisRound);

    // Remove objects that have been fully cleared (i.e. reached REQUIRED_CLICKS)
    setObjects((prev) => prev.filter((obj) => obj.totalClicks < REQUIRED_CLICKS));

    setRoundEnded(true);
    // After a delay, either end the game or start the next round.
    setTimeout(() => {
      if (totalBusted + bustedThisRound > BUSTED_THRESHOLD) {
        setGameOver(true);
      } else {
        setRound((prev) => prev + 1);
        setRoundEnded(false);
        startRound();
      }
    }, END_ROUND_DELAY);
  };

  // End the round automatically when the timer runs out.
  useEffect(() => {
    if (!gameOver && started && timeLeft <= 0 && !roundEnded) {
      endRound();
    }
  }, [timeLeft, gameOver, started, roundEnded]);

  // Also, if all objects (that are not busted) have been cleared (or there are none in play), end the round early.
  useEffect(() => {
    if (
      !gameOver &&
      started &&
      objects.filter((obj) => !obj.busted).length === 0 &&
      !roundEnded
    ) {
      endRound();
    }
  }, [objects, gameOver, started, roundEnded]);

  // Handle a tap/click on an object.
  // Increment both its totalClicks and roundClicks.
  // If totalClicks reaches the required 3 taps, remove it (cleared).
  // (Ignore taps on busted objects.)
  const handleClick = (id: number) => {
    if (gameOver || roundEnded) return;
    setObjects((prev) =>
      prev
        .map((obj) => {
          if (obj.id === id && !obj.busted) {
            const newTotal = obj.totalClicks + 1;
            const newRound = obj.roundClicks + 1;
            return { ...obj, totalClicks: newTotal, roundClicks: newRound };
          }
          return obj;
        })
        .filter((obj) => obj.totalClicks < REQUIRED_CLICKS)
    );
  };

  // Start the game when the user clicks the "Start Game" button.
  const handleStart = () => {
    setStarted(true);
    setRound(1);
    setObjects([]);
    setTotalBusted(0);
    setGameOver(false);
    setRoundEnded(false);
    setNextId(0);
    startRound();
  };

  // Restart the game (back to initial state).
  const handleRestart = () => {
    setStarted(false);
    setRound(1);
    setObjects([]);
    setTotalBusted(0);
    setGameOver(false);
    setRoundEnded(false);
    setNextId(0);
  };

  // Compute missed payments as the integer division of busted bags by 3.
  const missedPayments = Math.floor(totalBusted / 3);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 relative">
      {!started ? (
        <div className="text-center">
          <h1 className="text-6xl font-extrabold italic mb-4">Tap To Prosper</h1>
          <p>
            This game turns financial analysis into an interactive challenge.<br />
            Trash bags represent mortgage or payment obligations.<br />
            Each bag must be &quot;paid&quot; &#40;tapped&#41; three times to be cleared.<br />
            If a bag is not tapped at all during a round, it turns into a busted bag—symbolizing a missed payment.<br />
            As missed payments accumulate, they can eventually lead to game over, mirroring how missed mortgage payments can create serious financial problems.<br />
          </p>
          <div className="bg-white p-6 rounded-lg shadow-lg my-4">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">Game Rules</h2>
            <ul className="list-disc ml-6 space-y-2 text-lg text-purple-700 font-bold">
              <li>
                Each round starts with both new and carried-over trash bags representing financial obligations.
              </li>
              <li>
                Every trash bag requires three taps (payments) to clear it from the canvas.
              </li>
              <li>
                If a trash bag receives zero taps in a round, it becomes “busted” and remains visible in subsequent rounds.
              </li>
              <li>
                Busted bags accumulate to simulate missed payments; too many busted bags eventually lead to game over.
              </li>
              <li>
                If all active trash bags are successfully tapped (or partially tapped), the game vibrantly signals the start of the next round.
              </li>
              <li>
                The overall goal is to maintain consistent “payment” activity to prevent financial penalties and avoid game over.
              </li>
            </ul>
          </div>
          <button
            onClick={handleStart}
            className="px-4 py-2 bg-purple-800 text-white rounded"
          >
            Start Game
          </button>
        </div>
      ) : gameOver ? (
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-purple-800">Game Over</h1>
          <p className="mb-2">Total Busted Bags: {totalBusted}</p>
          <p className="mb-4">Missed Payments: {missedPayments}</p>
          <button
            onClick={handleRestart}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Restart Game
          </button>
        </div>
      ) : (
        <>
          {/* Game Info */}
          <div className="mb-4 text-center">
            <p className="text-lg font-semibold">Round: {round}</p>
            <p className="text-lg font-semibold">Time Left: {timeLeft} sec</p>
            <p className="text-lg font-semibold">Busted Bags: {totalBusted}</p>
            <p className="text-lg font-semibold">Missed Payments: {missedPayments}</p>
          </div>
          {/* Canvas */}
          <div className="w-96 h-96 bg-white border border-gray-300 relative">
            {objects.map((obj) => (
              <div
                key={obj.id}
                onClick={() => handleClick(obj.id)}
                className={`cursor-pointer absolute ${obj.busted ? "pointer-events-none" : ""}`}
                style={{ top: `${obj.top}%`, left: `${obj.left}%` }}
              >
                <img
                  src={obj.busted ? "/images/busted.png" : "/images/trashBag.png"}
                  alt={obj.busted ? "Busted Trash Bag" : "Trash Bag"}
                  className="w-20 h-20"
                />
              </div>
            ))}
            {/* Vibrant overlay when the round ends */}
            {roundEnded && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <h2 className="text-4xl font-bold text-purple-800 animate-pulse">
                  Starting Next Round!
                </h2>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GameBoard;
