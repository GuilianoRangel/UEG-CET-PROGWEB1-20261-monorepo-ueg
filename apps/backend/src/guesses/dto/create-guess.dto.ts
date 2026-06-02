import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateGuessDto {
  @IsUUID('4', { message: 'O ID do jogo deve ser um UUID válido' })
  @IsNotEmpty({ message: 'O ID do jogo é obrigatório' })
  matchId: string;

  @IsUUID('4', { message: 'O ID da opção de placar deve ser um UUID válido' })
  @IsNotEmpty({ message: 'O ID da opção de placar é obrigatório' })
  predictionOptionId: string;
}
