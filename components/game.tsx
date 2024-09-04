import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface GamePageProps {
  gameCode: string;
  playerName: string;
}

const GamePage: React.FC<GamePageProps> = ({ gameCode, playerName }) => {
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [transferAmount, setTransferAmount] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");

  useEffect(() => {
    fetchGameData();
  }, [gameCode]);

  const fetchGameData = async () => {
    try {
      const response = await fetch(`/api/games/${gameCode}`);
      const data = await response.json();
      console.log("response", response);

      if (response.ok) {
        setPlayers(data.players);
        setCurrentPlayer(data.players[0]);
      } else {
        console.error("Error fetching game data:", data.message);
      }
    } catch (error) {
      console.error("Error fetching game data:", error);
    }
  };

  const handleTransfer = async () => {
    if (!selectedPlayer || !transferAmount) return;

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
        // Oyun verilerini yeniden yükle
        fetchGameData();
      } else {
        console.error("Error making transfer:", data.message);
      }
    } catch (error) {
      console.error("Error making transfer:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Game: {gameCode}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>Players</CardHeader>
          <CardContent>
            {players.map((player) => (
              <div key={player.id} className="mb-2">
                {player.name}: ${player.balance}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>Make a Transfer</CardHeader>
          <CardContent>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="mb-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
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
              className="mb-2"
            />
            <Button onClick={handleTransfer}>Transfer</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GamePage;
