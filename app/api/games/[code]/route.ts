import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params;
    const playerName = localStorage.getItem("playerName");

    if (!code || typeof code !== "string") {
      return NextResponse.json({ message: "Invalid game code" }, { status: 400 });
    }

    // Fetch the game and its players
    const game = await prisma.game.findUnique({
      where: { code },
      include: { players: true },
    });

    if (!game) {
      return NextResponse.json({ message: "Game not found" }, { status: 404 });
    }

    // Return the game data
    return NextResponse.json(
      {
        id: game.id,
        code: game.code,
        players: game.players.map((player) => ({
          id: player.id,
          name: player.name,
          balance: player.balance,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching game data:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Keep the existing POST handler for joining a game
export { POST } from "./join/route";
