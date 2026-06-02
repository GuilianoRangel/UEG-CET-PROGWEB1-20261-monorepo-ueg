export interface CreateMatchPayload {
  teamA: string;
  teamB: string;
  matchDate: string; // ISO string UTC
  stadium?: string;
  referee?: string;
  options: {
    teamAScore: number;
    teamBScore: number;
  }[];
}
