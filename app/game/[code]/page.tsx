'use client';

import React from "react";
import { useParams, useSearchParams } from "next/navigation";
import GamePage from "../../../components/game";

const GamePageWrapper: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const code = params.code as string;
  const playerName = searchParams.get('playerName');

  if (typeof code !== "string") {
    return <div>Invalid game code</div>;
  }

  return <GamePage gameCode={code} playerName={playerName || ''} />;
};

export default GamePageWrapper;