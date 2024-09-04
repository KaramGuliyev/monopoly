import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface Player {
  id: string;
  name: string;
  balance: number;
}

interface GamePageProps {
  gameCode: string;
  playerName: string;
}

const GamePage: React.FC<GamePageProps> = ({ gameCode, playerName }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [transferAmount, setTransferAmount] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const router = useRouter();

  const fetchGameData = useCallback(async () => {
    try {
      const response = await fetch(`/api/games/${gameCode}`);
      const data = await response.json();
      if (response.ok) {
        setPlayers(data.players);
        setCurrentPlayer(data.players.find((p: Player) => p.name === playerName) || null);
      } else {
        console.error("Error fetching game data:", data.message);
      }
    } catch (error) {
      console.error("Error fetching game data:", error);
    }
  }, [gameCode, playerName]);

  useEffect(() => {
    fetchGameData();
    const interval = setInterval(fetchGameData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [fetchGameData]);

  const handleTransfer = async () => {
    if (!currentPlayer || !selectedPlayer || !transferAmount) return;

    try {
      const response = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromPlayerId: currentPlayer.id,
          toPlayerId: selectedPlayer,
          amount: parseInt(transferAmount),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Transfer successful:", data);
        fetchGameData();
        setTransferAmount("");
        setSelectedPlayer("");
      } else {
        console.error("Error making transfer:", data.message);
      }
    } catch (error) {
      console.error("Error making transfer:", error);
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
        fetchGameData();
      } else {
        console.error("Error joining game:", data.message);
      }
    } catch (error) {
      console.error("Error joining game:", error);
    }
  };

  const playerColors = ["bg-red-200", "bg-blue-200", "bg-green-200", "bg-yellow-200"];

  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Game: {gameCode}</h1>
      <div className="w-full max-w-3xl">
        <Card className="mb-8">
          <CardHeader className="text-xl font-semibold">Players</CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className={`p-4 rounded-lg ${playerColors[index]} ${players[index] ? "" : "opacity-50"}`}>
                  {players[index] ? (
                    <div>
                      <p className="font-semibold">{players[index].name}</p>
                      <p>${players[index].balance}</p>
                    </div>
                  ) : (
                    <p>Waiting for player...</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          {players.length < 4 && !currentPlayer && (
            <CardFooter>
              <Button onClick={handleJoinGame} className="w-full">
                Join Game
              </Button>
            </CardFooter>
          )}
        </Card>
        {currentPlayer && (
          <Card>
            <CardHeader className="text-xl font-semibold">Make a Transfer</CardHeader>
            <CardContent>
              <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="mb-4 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                <option value="">Select a player</option>
                {players
                  .filter((p) => p.id !== currentPlayer?.id)
                  .map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
              </select>
              <Input
                type="number"
                placeholder="Enter amount"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="mb-4"
              />
              <Button onClick={handleTransfer} className="w-full">
                Transfer
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GamePage;
