import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateGuessDto {
  @IsUUID()
  @IsNotEmpty()
  matchId: string;

  @IsUUID()
  @IsNotEmpty()
  predictionOptionId: string;
}
