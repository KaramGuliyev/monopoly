import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/app/components/ui/card";
import { useRouter } from "next/navigation";
import io from "socket.io-client";
import { FaCopy } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

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
  const [socket, setSocket] = useState<any>(null);
  const router = useRouter();
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    const storedPlayerId = localStorage.getItem(`playerId_${gameCode}_${playerName}`);
    if (storedPlayerId) {
      setPlayerId(storedPlayerId);
    }

    const newSocket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:3001");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket");
      newSocket.emit("joinGame", { gameCode, playerName, playerId: storedPlayerId });
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    newSocket.on("gameUpdate", (updatedGameData: any) => {
      console.log(updatedGameData);
      setPlayers(updatedGameData.players);
      const updatedCurrentPlayer = updatedGameData.players.find((p: Player) => p.name === playerName);
      if (updatedCurrentPlayer) {
        setCurrentPlayer(updatedCurrentPlayer);
        if (!playerId) {
          setPlayerId(updatedCurrentPlayer.id);
          localStorage.setItem(`playerId_${gameCode}_${playerName}`, updatedCurrentPlayer.id);
        }
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [gameCode, playerName, playerId]);

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

  const handleTransfer = async () => {
    toast(`Transferring ${transferAmount} to ${selectedPlayer}...`, {
      icon: "💸",
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
      position: "top-center",
    });
    if (!currentPlayer || !selectedPlayer || !transferAmount) {
      console.error("Transfer data incomplete:", { currentPlayer, selectedPlayer, transferAmount });
      return;
    }

    console.log(currentPlayer.name);

    try {
      const transferData = {
        fromPlayerName: currentPlayer.name,
        toPlayerName: players.find((p) => p.id === selectedPlayer)?.name,
        amount: parseInt(transferAmount),
        gameCode: gameCode,
      };

      console.log(transferData);

      socket.emit("transfer", transferData, (response: Response) => {
        console.log("Transfer event response:", response);
      });

      setTransferAmount("");
      setSelectedPlayer("");
    } catch (error) {
      console.error("Error in handleTransfer:", error);
    }
  };

  const handleBankTransfer = async (flag: string) => {
    toast(`Bank ${flag}...`, {
      icon: "💸",
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
      position: "top-center",
    });
    if (!currentPlayer || !transferAmount) {
      console.error("Transfer data incomplete:", { currentPlayer, transferAmount, flag });
      return;
    }

    console.log(currentPlayer.name);

    try {
      const transferData = {
        fromPlayerName: currentPlayer.name,
        amount: parseInt(transferAmount),
        gameCode: gameCode,
        flag: flag,
      };

      console.log(transferData);

      socket.emit("bankTransfer", transferData, (response: Response) => {
        console.log("Transfer event response:", response);
      });

      setTransferAmount("");
    } catch (error) {
      console.error("Error in handleBankTransfer:", error);
    }
  };

  const handleJoinGame = async () => {
    toast("Joining game...", {
      icon: "🔗",
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
      position: "top-center",
    });
    try {
      socket.emit("joinGame", { gameCode, playerName });
    } catch (error) {
      console.error("Error joining game:", error);
    }
  };

  const playerColors = ["bg-red-100", "bg-blue-100", "bg-green-100", "bg-yellow-100"];
  const playerBorders = ["border-red-500", "border-blue-500", "border-green-500", "border-yellow-500"];

  const copyGameCode = () => {
    navigator.clipboard.writeText(gameCode).then(
      () => {
        toast("Game code copied to clipboard!", {
          icon: "📋",
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
          position: "top-center",
        });
      },
      (err) => {
        console.error("Could not copy text: ", err);
        toast.error("Failed to copy game code");
      }
    );
  };

  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
      <Toaster position="top-right" />
      <div className="flex items-center mb-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mr-4">Game: {gameCode}</h1>
        <Button
          onClick={copyGameCode}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center transition-colors duration-300"
        >
          <FaCopy className="mr-2" />
          Copy
        </Button>
      </div>
      <div className="w-full max-w-4xl">
        <Card className="mb-8 shadow-lg">
          <CardHeader className="text-2xl font-semibold text-center bg-gray-100 py-4">Players</CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${playerColors[index]} ${playerBorders[index]} border-2 ${
                    players[index] ? "" : "opacity-50"
                  } transition-all duration-300 hover:shadow-md`}
                >
                  {players[index] ? (
                    <div className="text-center">
                      <p className="font-semibold text-lg mb-2">{players[index].name}</p>
                      <p className="text-2xl font-bold">${players[index].balance}</p>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">Waiting for player...</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          {players.length < 4 && !currentPlayer && (
            <CardFooter>
              <Button
                onClick={handleJoinGame}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
              >
                Join Game
              </Button>
            </CardFooter>
          )}
        </Card>
        {currentPlayer && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-lg">
              <CardHeader className="text-xl font-semibold text-center bg-gray-100 py-4">Make a Transfer</CardHeader>
              <CardContent className="p-6">
                <select
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                  className="mb-4 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300"
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
                <Button
                  onClick={handleTransfer}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                >
                  Transfer
                </Button>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader className="text-xl font-semibold text-center bg-gray-100 py-4">BANK</CardHeader>
              <CardContent className="p-6">
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="mb-4"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleBankTransfer("take")}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                  >
                    Take Loan
                  </Button>
                  <Button
                    onClick={() => handleBankTransfer("pay")}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                  >
                    Pay Loan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePage;
