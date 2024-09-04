import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import { CreateGameRequest, CreateGameResponse } from "../../types/game";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse<CreateGameResponse | { message: string }>) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { playerName } = req.body as CreateGameRequest;

    if (!playerName) {
      return res.status(400).json({ message: "Player name is required" });
    }

    // Benzersiz bir oyun kodu oluştur
    const gameCode = nanoid(6).toUpperCase();

    // Yeni oyun oluştur ve ilk oyuncuyu ekle
    const newGame = await prisma.game.create({
      data: {
        code: gameCode,
        players: {
          create: [
            {
              name: playerName,
              balance: 1500, // Başlangıç bakiyesi
            },
          ],
        },
      },
      include: {
        players: true,
      },
    });

    res.status(201).json({
      message: "Game created successfully",
      gameCode: newGame.code,
      playerId: newGame.players[0].id,
    });
  } catch (error) {
    console.error("Game creation error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
