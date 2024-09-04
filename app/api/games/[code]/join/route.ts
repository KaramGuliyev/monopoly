import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { JoinGameRequest, JoinGameResponse } from "@/types/game";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    const body: JoinGameRequest = await request.json();
    const { playerName } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ message: "Invalid game code" }, { status: 400 });
    }

    if (!playerName) {
      return NextResponse.json({ message: "Player name is required" }, { status: 400 });
    }

    // Oyunun var olup olmadığını kontrol et
    const game = await prisma.game.findUnique({
      where: { code },
      include: { players: true },
    });

    if (!game) {
      return NextResponse.json({ message: "Game not found" }, { status: 404 });
    }

    if (game.players.length >= 4) {
      return NextResponse.json({ message: "Game is full" }, { status: 400 });
    }

    // Yeni oyuncuyu ekle
    const newPlayer = await prisma.player.create({
      data: {
        name: playerName,
        balance: 1500, // Başlangıç bakiyesi
        gameId: game.id,
      },
    });

    return NextResponse.json({
      message: "Successfully joined the game",
      playerId: newPlayer.id,
    }, { status: 200 });
  } catch (error) {
    console.error("Join game error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}