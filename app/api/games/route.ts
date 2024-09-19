import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import { CreateGameRequest, CreateGameResponse } from "../../../types/game";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body: CreateGameRequest = await request.json();
    const { playerName } = body;

    if (!playerName) {
      return NextResponse.json({ message: "Player name is required" }, { status: 400 });
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
              balance: 15000000, // Başlangıç bakiyesi
            },
          ],
        },
      },
      include: {
        players: true,
      },
    });

    const response: CreateGameResponse = {
      message: "Game created successfully",
      gameCode: newGame.code,
      playerId: newGame.players[0].id,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Game creation error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
