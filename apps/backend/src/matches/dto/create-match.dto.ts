import { IsString, IsNotEmpty, IsDateString, ValidateNested, ArrayMinSize, ArrayMaxSize, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePredictionOptionDto {
  @IsNumber()
  @Min(0)
  teamAScore: number;

  @IsNumber()
  @Min(0)
  teamBScore: number;
}

export class CreateMatchDto {
  @IsString()
  @IsNotEmpty({ message: 'O time mandante é obrigatório' })
  teamA: string;

  @IsString()
  @IsNotEmpty({ message: 'O time visitante é obrigatório' })
  teamB: string;

  @IsDateString({}, { message: 'A data do jogo deve ser uma data válida' })
  matchDate: string;

  @IsString()
  @IsNotEmpty({ message: 'O estádio é obrigatório' })
  stadium: string;

  @IsString()
  @IsNotEmpty({ message: 'O juiz é obrigatório' })
  referee: string;

  @ValidateNested({ each: true })
  @Type(() => CreatePredictionOptionDto)
  @ArrayMinSize(1, { message: 'O jogo deve ter pelo menos 1 opção de placar' })
  @ArrayMaxSize(4, { message: 'O jogo pode ter no máximo 4 opções de placar' })
  options: CreatePredictionOptionDto[];
}
