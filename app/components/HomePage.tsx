"use client";

import React, { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import { useRouter } from "next/navigation";

export const HomePage = () => {
  const [playerName, setPlayerName] = useState("");
  const [gameCode, setGameCode] = useState("");
  const router = useRouter();

  const handleCreateGame = async () => {
    try {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Game created:", data);
        router.push(`/game/${data.gameCode}?playerName=${encodeURIComponent(playerName)}`);
      } else {
        console.error("Error creating game:", data.message);
      }
    } catch (error) {
      console.error("Error creating game:", error);
    }
  };

  const handleJoinGame = async () => {
    try {
      const response = await fetch(`/api/games/${gameCode}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Joined game:", data);
        router.push(`/game/${gameCode}?playerName=${encodeURIComponent(playerName)}`);
      } else {
        console.error("Error joining game:", data.message);
      }
    } catch (error) {
      console.error("Error joining game:", error);
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col justify-center items-center text-black">
      <h1 className="text-6xl font-extrabold mb-8 text-center text-black tracking-tight">
        Monopoly Bank App
        <span className="block text-2xl mt-2 font-normal">Because who needs real money anyway?</span>
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card className="backdrop-blur-lg bg-white/30 border border-white/20">
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
                  className="bg-white/20 text-black placeholder-white/50"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-white/20 hover:bg-white/30 text-black font-bold" onClick={handleCreateGame}>
              Create Game (If You Dare)
            </Button>
          </CardFooter>
        </Card>
        <Card className="backdrop-blur-lg bg-white/30 border border-white/20">
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
                  className="bg-white/20 text-black placeholder-white/50"
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
                  className="bg-white/20 text-black placeholder-white/50"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-white/20 hover:bg-white/30 text-black font-bold" onClick={handleJoinGame}>
              Join Game (Good Luck, Sucker)
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
