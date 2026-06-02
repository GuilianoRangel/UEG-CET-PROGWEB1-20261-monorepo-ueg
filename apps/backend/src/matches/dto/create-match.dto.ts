import { IsString, IsNotEmpty, IsDateString, IsOptional, ArrayMinSize, ArrayMaxSize, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePredictionOptionDto {
  @IsInt()
  @Min(0)
  teamAScore: number;

  @IsInt()
  @Min(0)
  teamBScore: number;
}

export class CreateMatchDto {
  @IsString()
  @IsNotEmpty()
  teamA: string;

  @IsString()
  @IsNotEmpty()
  teamB: string;

  @IsDateString()
  matchDate: string;

  @IsString()
  @IsOptional()
  stadium?: string;

  @IsString()
  @IsOptional()
  referee?: string;

  @ValidateNested({ each: true })
  @Type(() => CreatePredictionOptionDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(4)
  options: CreatePredictionOptionDto[];
}
