export interface Player {
  id: string;
  name: string;
  balance: number;
  gameId: string;
}

export interface Game {
  id: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
  players: Player[];
}

export interface Transfer {
  id: string;
  amount: number;
  fromPlayerId: string;
  toPlayerId: string;
  createdAt: Date;
}

export interface CreateGameRequest {
  playerName: string;
}

export interface CreateGameResponse {
  message: string;
  gameCode: string;
  playerId: string;
}

export interface JoinGameRequest {
  gameCode: string;
  playerName: string;
}

export interface JoinGameResponse {
  message: string;
  playerId: string;
}
