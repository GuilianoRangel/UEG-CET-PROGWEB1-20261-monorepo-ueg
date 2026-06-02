export interface PredictionOptionDto {
  id: string;
  matchId: string;
  teamAScore: number;
  teamBScore: number;
  guessCount?: number;
}

export interface MatchDto {
  id: string;
  teamA: string;
  teamB: string;
  matchDate: string | Date;
  stadium: string;
  referee: string;
  isClosed: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  options?: PredictionOptionDto[];
}

export interface CreateMatchPayload {
  teamA: string;
  teamB: string;
  matchDate: string | Date;
  stadium: string;
  referee: string;
  options: Array<{ teamAScore: number; teamBScore: number }>;
}

export interface UserGuessDto {
  id: string;
  userId: string;
  matchId: string;
  predictionOptionId: string;
  createdAt: string | Date;
}
