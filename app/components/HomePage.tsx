"use client";

import React, { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { FaSpinner } from "react-icons/fa";

export const HomePage = () => {
  const [playerName, setPlayerName] = useState("");
  const [gameCode, setGameCode] = useState("");
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [isJoiningGame, setIsJoiningGame] = useState(false);
  const router = useRouter();

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      toast.error("Please enter your name before creating a game.", {
        icon: "🙅‍♂️",
        duration: 3000,
      });
      return;
    }

    setIsCreatingGame(true);
    try {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName }),
      });
      console.log(response);

      const data = await response.json();
      localStorage.setItem("playerName", playerName);
      if (response.ok) {
        toast.success("Game created successfully! Prepare to lose all your virtual money!", {
          icon: "🎉",
          duration: 3000,
        });
        router.push(`/game/${data.gameCode}`);
      } else {
        toast.error(`Error creating game: ${data.message}`, {
          icon: "😢",
          duration: 4000,
        });
      }
    } catch (error) {
      toast.error("Oops! Something went wrong. Maybe the Monopoly gods are against you?", {
        icon: "🎲",
        duration: 4000,
      });
    } finally {
      setIsCreatingGame(false);
    }
  };

  const handleJoinGame = async () => {
    if (!playerName.trim() || !gameCode.trim()) {
      toast.error("Please enter both your name and the game code.", {
        icon: "🚫",
        duration: 3000,
      });
      return;
    }

    setIsJoiningGame(true);
    try {
      const response = await fetch(`/api/games/${gameCode}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      localStorage.setItem("playerName", playerName);
      const data = await response.json();
      if (response.ok) {
        toast.success("You've joined the game! Time to crush your opponents (or go bankrupt trying)!", {
          icon: "🏠",
          duration: 3000,
        });
        router.push(`/game/${gameCode}}`);
      } else {
        toast.error(`Error joining game: ${data.message}`, {
          icon: "🚷",
          duration: 4000,
        });
      }
    } catch (error) {
      toast.error("Failed to join the game. Did you try turning it off and on again?", {
        icon: "🔌",
        duration: 4000,
      });
    } finally {
      setIsJoiningGame(false);
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col justify-center items-center text-black">
      <Toaster position="top-right" />
      <h1 className="text-6xl font-extrabold mb-8 text-center text-black tracking-tight">
        Monopoly Bank App
        <span className="block text-2xl mt-2 font-normal">Because who needs real money anyway?</span>
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card className="backdrop-blur-lg bg-white/30 border border-white/20 transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-black">Create a New Game</CardTitle>
            <CardDescription className="text-lg text-black/80">
              Start a new Monopoly game session, you masochist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="create-name" className="text-black">
                  Your Alias
                </Label>
                <Input
                  id="create-name"
                  placeholder="Enter your totally real name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="bg-white/20 text-black placeholder-white/50 transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-white/20 hover:bg-white/30 text-black font-bold transition-all duration-300 transform hover:scale-105"
              onClick={handleCreateGame}
              disabled={isCreatingGame}
            >
              {isCreatingGame ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Creating Game...
                </>
              ) : (
                "Create Game (If You Dare)"
              )}
            </Button>
          </CardFooter>
        </Card>
        <Card className="backdrop-blur-lg bg-white/30 border border-white/20 transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-black">Join a Game</CardTitle>
            <CardDescription className="text-lg text-black/80">Enter an existing game session, you follower</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="join-name" className="text-black">
                  Your Alias
                </Label>
                <Input
                  id="join-name"
                  placeholder="Enter your probably fake name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="bg-white/20 text-black placeholder-white/50 transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="game-code" className="text-black">
                  Secret Game Code
                </Label>
                <Input
                  id="game-code"
                  placeholder="Enter the super secret code"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value)}
                  className="bg-white/20 text-black placeholder-white/50 transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-white/20 hover:bg-white/30 text-black font-bold transition-all duration-300 transform hover:scale-105"
              onClick={handleJoinGame}
              disabled={isJoiningGame}
            >
              {isJoiningGame ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Joining Game...
                </>
              ) : (
                "Join Game (Good Luck, Sucker)"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
