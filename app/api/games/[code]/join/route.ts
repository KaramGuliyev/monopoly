import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request, { params }: { params: { code: string } }) {
  try {
    const { playerName } = await request.json();
    if (!playerName) {
      return NextResponse.json({ message: "Player name not found" }, { status: 400 });
    }
    const { code } = params;

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

    const newPlayer = await prisma.player.create({
      data: {
        name: playerName,
        balance: 15000000,
        gameId: game.id,
      },
    });

    return NextResponse.json({ message: "Joined game successfully", playerId: newPlayer.id }, { status: 200 });
  } catch (error) {
    console.error("Error joining game:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
