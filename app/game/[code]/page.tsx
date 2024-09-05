"use client";

import React, { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import GamePage from "@/app/components/Game";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/app/components/ui/card";
import toast, { Toaster } from "react-hot-toast";

const GamePageWrapper: React.FC = () => {
  const params = useParams();
  const code = params?.code as string;
  const playerNameRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const storedName = localStorage.getItem("playerName");
    if (storedName && playerNameRef.current) {
      playerNameRef.current.value = storedName;
    }
  }, []);

  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    const playerName = playerNameRef.current?.value.trim();
    if (playerName) {
      localStorage.setItem("playerName", playerName);
      toast.success(`Welcome to the game, ${playerName}!`, {
        icon: "👋",
        duration: 3000,
      });
      router.push(`/game/${code}`);
    } else {
      toast.error("Please enter your name before starting the game.", {
        icon: "🙅‍♂️",
        duration: 3000,
      });
    }
  };

  if (typeof code !== "string") {
    return <div>Invalid game code</div>;
  }

  const storedName = typeof window !== 'undefined' ? localStorage.getItem("playerName") : null;

  if (!storedName) {
    return (
      <div className="container mx-auto p-4 min-h-screen flex flex-col justify-center items-center">
        <Toaster position="top-right" />
        <Card className="w-full max-w-md backdrop-blur-lg bg-white/30 border border-white/20 transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-black text-center">Enter Your Name</CardTitle>
          </CardHeader>
          <form onSubmit={handleStartGame}>
            <CardContent>
              <Input
                type="text"
                placeholder="Your totally real name"
                ref={playerNameRef}
                className="bg-white/20 text-black placeholder-black/50 transition-all duration-300 focus:ring-2 focus:ring-blue-500"
              />
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all duration-300 transform hover:scale-105"
              >
                Start Game
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return <GamePage gameCode={code} playerName={storedName} />;
};

export default GamePageWrapper;
