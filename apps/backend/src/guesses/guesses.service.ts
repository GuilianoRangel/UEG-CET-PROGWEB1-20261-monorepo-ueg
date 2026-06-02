import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGuess } from './entities/user-guess.entity';
import { CreateGuessDto } from './dto/create-guess.dto';
import { MatchesService } from '../matches/matches.service';
import { BusinessException } from '../common/exceptions/business.exception';

@Injectable()
export class GuessesService {
  constructor(
    @InjectRepository(UserGuess)
    private readonly userGuessRepository: Repository<UserGuess>,
    private readonly matchesService: MatchesService,
  ) {}

  async create(userId: string, createGuessDto: CreateGuessDto): Promise<UserGuess> {
    const match = await this.matchesService.findOne(createGuessDto.matchId);

    if (this.matchesService.isMatchClosed(match)) {
      throw new BusinessException(
        'Não é possível palpitar em um jogo encerrado',
        'MATCH_CLOSED',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingGuess = await this.userGuessRepository.findOne({
      where: { userId, matchId: createGuessDto.matchId },
    });

    if (existingGuess) {
      throw new BusinessException(
        'Você já enviou um palpite para este jogo',
        'GUESS_ALREADY_EXISTS',
        HttpStatus.BAD_REQUEST,
      );
    }

    const optionExists = match.options.some((opt) => opt.id === createGuessDto.predictionOptionId);
    if (!optionExists) {
      throw new BusinessException(
        'Opção de placar inválida para este jogo',
        'OPTION_INVALID',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userGuess = new UserGuess();
    userGuess.userId = userId;
    userGuess.matchId = createGuessDto.matchId;
    userGuess.predictionOptionId = createGuessDto.predictionOptionId;

    return this.userGuessRepository.save(userGuess);
  }

  async findOpenMatches(userId: string): Promise<any[]> {
    const matches = await this.matchesService.findAll();
    const openMatches = matches.filter((match) => !this.matchesService.isMatchClosed(match));

    const results = [];
    for (const match of openMatches) {
      // Find if this user already guessed on this match
      const userGuess = await this.userGuessRepository.findOne({
        where: { userId, matchId: match.id },
      });

      const optionsWithCount = [];
      for (const option of match.options || []) {
        const guessCount = await this.userGuessRepository.count({
          where: { predictionOptionId: option.id },
        });
        optionsWithCount.push({
          ...option,
          guessCount,
        });
      }

      results.push({
        ...match,
        options: optionsWithCount,
        userGuessId: userGuess?.id || null,
        userPredictionOptionId: userGuess?.predictionOptionId || null,
      });
    }

    return results;
  }

  async findMyClosedMatches(userId: string): Promise<any[]> {
    const userGuesses = await this.userGuessRepository.find({
      where: { userId },
      relations: ['match', 'match.options'],
    });

    const closedGuesses = userGuesses.filter((ug) => this.matchesService.isMatchClosed(ug.match));

    const results = [];
    for (const ug of closedGuesses) {
      const match = ug.match;
      const optionsWithCount = [];
      for (const option of match.options || []) {
        const guessCount = await this.userGuessRepository.count({
          where: { predictionOptionId: option.id },
        });
        optionsWithCount.push({
          ...option,
          guessCount,
        });
      }

      results.push({
        id: ug.id,
        userId: ug.userId,
        matchId: ug.matchId,
        predictionOptionId: ug.predictionOptionId,
        createdAt: ug.createdAt,
        match: {
          ...match,
          options: optionsWithCount,
        },
      });
    }

    return results;
  }
}
