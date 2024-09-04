import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { JoinGameRequest, JoinGameResponse } from "../../../types/game";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse<JoinGameResponse | { message: string }>) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { code } = req.query;
    const { playerName } = req.body as JoinGameRequest;

    if (!code || typeof code !== "string") {
      return res.status(400).json({ message: "Invalid game code" });
    }

    if (!playerName) {
      return res.status(400).json({ message: "Player name is required" });
    }

    // Oyunun var olup olmadığını kontrol et
    const game = await prisma.game.findUnique({
      where: { code },
      include: { players: true },
    });

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    if (game.players.length >= 4) {
      return res.status(400).json({ message: "Game is full" });
    }

    // Yeni oyuncuyu ekle
    const newPlayer = await prisma.player.create({
      data: {
        name: playerName,
        balance: 1500, // Başlangıç bakiyesi
        gameId: game.id,
      },
    });

    res.status(200).json({
      message: "Successfully joined the game",
      playerId: newPlayer.id,
    });
  } catch (error) {
    console.error("Join game error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
