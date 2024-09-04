import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { CreateTransferRequest, CreateTransferResponse } from "@/types/game";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body: CreateTransferRequest = await request.json();
    const { fromPlayerId, toPlayerId, amount } = body;

    if (!fromPlayerId || !toPlayerId || !amount) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ message: "Amount must be positive" }, { status: 400 });
    }

    // Gönderen ve alıcı oyuncuları bul
    const fromPlayer = await prisma.player.findUnique({ where: { id: fromPlayerId } });
    const toPlayer = await prisma.player.findUnique({ where: { id: toPlayerId } });

    if (!fromPlayer || !toPlayer) {
      return NextResponse.json({ message: "One or both players not found" }, { status: 404 });
    }

    if (fromPlayer.gameId !== toPlayer.gameId) {
      return NextResponse.json({ message: "Players are not in the same game" }, { status: 400 });
    }

    if (fromPlayer.balance < amount) {
      return NextResponse.json({ message: "Insufficient balance" }, { status: 400 });
    }

    // Transfer işlemini gerçekleştir
    const [transfer, updatedFromPlayer, updatedToPlayer] = await prisma.$transaction([
      prisma.transfer.create({
        data: {
          amount,
          fromPlayerId,
          toPlayerId,
        },
      }),
      prisma.player.update({
        where: { id: fromPlayerId },
        data: { balance: { decrement: amount } },
      }),
      prisma.player.update({
        where: { id: toPlayerId },
        data: { balance: { increment: amount } },
      }),
    ]);

    const response: CreateTransferResponse = {
      message: "Transfer successful",
      transferId: transfer.id,
      fromPlayerBalance: updatedFromPlayer.balance,
      toPlayerBalance: updatedToPlayer.balance,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Transfer error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
