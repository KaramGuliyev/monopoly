import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/app/components/ui/card";
import { useRouter } from "next/navigation";
import io from "socket.io-client";
import { FaCopy, FaChevronDown, FaChevronUp } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

interface Player {
  id: string;
  name: string;
  balance: number;
}

interface GamePageProps {
  gameCode: string;
  playerName?: string;
}

const GamePage: React.FC<GamePageProps> = ({ gameCode, playerName }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [transferAmount, setTransferAmount] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [socket, setSocket] = useState<any>(null);
  const router = useRouter();
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isTransferExpanded, setIsTransferExpanded] = useState(false);
  const [isBankExpanded, setIsBankExpanded] = useState(false);
  const [lastTransfer, setLastTransfer] = useState<{ from: string; to: string; amount: number } | null>(null);

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
      setPlayers(updatedGameData.players);
      const updatedCurrentPlayer = updatedGameData.players.find((p: Player) => p.name === playerName);
      if (updatedCurrentPlayer) {
        setCurrentPlayer(updatedCurrentPlayer);
        if (!playerId) {
          setPlayerId(updatedCurrentPlayer.id);
          localStorage.setItem(`playerId_${gameCode}_${playerName}`, updatedCurrentPlayer.id);
        }
      }
      
      // Check for transfer
      if (updatedGameData.lastTransfer && 
          (updatedGameData.lastTransfer.from !== lastTransfer?.from ||
           updatedGameData.lastTransfer.to !== lastTransfer?.to ||
           updatedGameData.lastTransfer.amount !== lastTransfer?.amount)) {
        setLastTransfer(updatedGameData.lastTransfer);
        toast.success(
          `${updatedGameData.lastTransfer.from} sent $${formatNumber(updatedGameData.lastTransfer.amount)} to ${updatedGameData.lastTransfer.to}`,
          {
            duration: 5000,
            icon: "💸",
          }
        );
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [gameCode, playerName, playerId, lastTransfer]);

  const handleTransferAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setTransferAmount(formatNumberWithCommas(value));
  };

  const formatNumberWithCommas = (value: string): string => {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const parseFormattedNumber = (value: string): number => {
    return parseInt(value.replace(/,/g, ''), 10);
  };

  const handleTransfer = async () => {
    if (!currentPlayer || !selectedPlayer || !transferAmount) {
      toast.error("Oops! Looks like you're trying to transfer imaginary money to an imaginary friend.", {
        icon: "🤦‍♂️",
        duration: 4000,
      });
      return;
    }

    const amount = parseFormattedNumber(transferAmount);

    toast.promise(
      new Promise((resolve, reject) => {
        socket.emit(
          "transfer",
          {
            fromPlayerName: currentPlayer.name,
            toPlayerName: players.find((p) => p.id === selectedPlayer)?.name,
            amount: amount,
            gameCode: gameCode,
          },
          (response: any) => {
            if (response && response.success) {
              resolve(response.message); // Başarı durumunda
            } else {
              reject(new Error(response.message || "Bank transfer failed")); // Hata durumunda
            }
          }
        );
      }),
      {
        loading: `Transferring ${transferAmount} to ${
          players.find((p) => p.id === selectedPlayer)?.name
        }... Hope they're worth it!`,
        success: `Transfer complete! You're ${transferAmount} poorer. Congrats?`,
        error: "Transfer failed. The bank must be as broke as you are!",
      }
    );

    setTransferAmount("");
    setSelectedPlayer("");
  };

  const handleBankTransfer = async (flag: string) => {
    if (!currentPlayer || !transferAmount) {
      toast.error("Trying to manipulate thin air? That's not how money works, buddy.", {
        icon: "💸",
        duration: 4000,
      });
      return;
    }

    const amount = parseFormattedNumber(transferAmount);
    const action = flag === "take" ? "Borrowing" : "Repaying";
    const consequence = flag === "take" ? "deeper in debt" : "slightly less poor";

    toast.promise(
      new Promise((resolve, reject) => {
        socket.emit(
          "bankTransfer",
          {
            fromPlayerName: currentPlayer.name,
            amount: amount,
            gameCode: gameCode,
            flag: flag,
          },
          (response: any) => {
            if (response && response.success) {
              resolve(response.message); // Başarı durumunda
            } else {
              reject(new Error(response.message || "Bank transfer failed")); // Hata durumunda
            }
          }
        );
      }),
      {
        loading: `${action} ${transferAmount} from the bank... Fingers crossed they don't check your credit score!`,
        success: `${action} successful! You're now ${consequence}. Living the dream, huh?`,
        error: "Transaction failed. Have you tried asking your parents for money instead?",
      }
    );

    setTransferAmount("");
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

  const playerColors = [
    "bg-red-100", "bg-blue-100", "bg-green-100", 
    "bg-yellow-100", "bg-purple-100", "bg-pink-100"
  ];
  const playerBorders = [
    "border-red-500", "border-blue-500", "border-green-500", 
    "border-yellow-500", "border-purple-500", "border-pink-500"
  ];

  const copyGameCode = () => {
    navigator.clipboard.writeText(`${window.location.origin}/game/${gameCode}`).then(
      () => {
        toast.success("Game code copied! Now you can invite friends... if you have any.", {
          icon: "📋",
          duration: 3000,
        });
      },
      (err) => {
        toast.error("Failed to copy. Technology is hard, isn't it?", {
          icon: "😅",
          duration: 3000,
        });
      }
    );
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
      <Toaster position="top-right" />
      <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors duration-300 mb-4 font-semibold">
        ← Home Page
      </Link>
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mr-4">Game: {gameCode}</h1>
        <span
          onClick={copyGameCode}
          className="bg-blue-500 mt-4 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center transition-colors duration-300 cursor-pointer"
        >
          <FaCopy className="mr-2" /> Copy
        </span>
      </div>
      <div className="w-full max-w-4xl">
        <Card className="mb-8 shadow-lg flex flex-col">
          <CardHeader className="text-2xl font-semibold text-center bg-gray-100 py-4">Players</CardHeader>
          <CardContent className="p-6 grow">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${playerColors[index]} ${playerBorders[index]} border-2 ${
                    players[index] ? "" : "opacity-50"
                  } transition-all duration-300 hover:shadow-md`}
                >
                  {players[index] ? (
                    <div className="text-center">
                      <p className="font-semibold text-lg mb-2">{players[index].name}</p>
                      <p className="text-2xl font-bold">${formatNumber(players[index].balance)}</p>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">Waiting for player...</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          {players.length < 4 && !currentPlayer && (
            <CardFooter className="mt-auto">
              <Button
                onClick={handleJoinGame}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300 animate-pulse"
              >
                Join Game
              </Button>
            </CardFooter>
          )}
        </Card>
        {currentPlayer && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            <Card className="shadow-lg">
              <CardHeader
                className="text-xl font-semibold text-center bg-gray-100 py-4 cursor-pointer flex justify-between items-center"
                onClick={() => setIsTransferExpanded(!isTransferExpanded)}
              >
                <span>Make a Transfer</span>
                {isTransferExpanded ? <FaChevronUp /> : <FaChevronDown />}
              </CardHeader>
              {isTransferExpanded && (
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
                  <input
                    type="text"
                    value={transferAmount}
                    onChange={handleTransferAmountChange}
                    placeholder="Enter amount"
                    className="mb-4 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300"
                  />
                  <Button
                    onClick={handleTransfer}
                    className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
                  >
                    Transfer
                  </Button>
                </CardContent>
              )}
            </Card>
            <Card className="shadow-lg">
              <CardHeader
                className="text-xl font-semibold text-center bg-gray-100 py-4 cursor-pointer flex justify-between items-center"
                onClick={() => setIsBankExpanded(!isBankExpanded)}
              >
                <span>BANK</span>
                {isBankExpanded ? <FaChevronUp /> : <FaChevronDown />}
              </CardHeader>
              {isBankExpanded && (
                <CardContent className="p-6">
                  <input
                    type="text"
                    value={transferAmount}
                    onChange={handleTransferAmountChange}
                    placeholder="Enter amount"
                    className="mb-4 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300"
                  />
                  <div className="grid grid-cols-2 gap-4 mt-4">
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
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePage;
