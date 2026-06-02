import { PredictionOptionDto } from './prediction-option.dto';

export interface MatchDto {
  id: string;
  teamA: string;
  teamB: string;
  matchDate: string; // ISO string UTC
  stadium?: string;
  referee?: string;
  isClosed: boolean;
  createdAt?: string;
  updatedAt?: string;
  predictionOptions: PredictionOptionDto[];
  userGuess?: {
    id: string;
    predictionOptionId: string;
    createdAt: string;
  };
}
