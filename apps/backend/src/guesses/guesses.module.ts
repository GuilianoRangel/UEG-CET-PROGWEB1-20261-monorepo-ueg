import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserGuess } from './entities/user-guess.entity';
import { GuessesService } from './guesses.service';
import { GuessesController } from './guesses.controller';
import { MatchesModule } from '../matches/matches.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserGuess]),
    MatchesModule,
  ],
  providers: [GuessesService],
  controllers: [GuessesController],
  exports: [GuessesService],
})
export class GuessesModule {}
