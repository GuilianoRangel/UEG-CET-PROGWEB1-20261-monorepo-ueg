import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGuess } from './entities/user-guess.entity';
import { MatchesService } from '../matches/matches.service';
import { CreateGuessDto } from './dto/create-guess.dto';
import { MatchDto } from '@repo/utils';

@Injectable()
export class GuessesService {
  constructor(
    @InjectRepository(UserGuess)
    private readonly userGuessRepository: Repository<UserGuess>,
    private readonly matchesService: MatchesService,
  ) {}

  async create(userId: string, createGuessDto: CreateGuessDto): Promise<UserGuess> {
    const { matchId, predictionOptionId } = createGuessDto;

    const match = await this.matchesService.findById(matchId);

    if (this.matchesService.isMatchClosed(match)) {
      throw new BusinessException(
        'Não é possível palpitar em um jogo encerrado.',
        'MATCH_CLOSED',
        HttpStatus.BAD_REQUEST,
      );
    }

    const optionBelongsToMatch = match.predictionOptions.some(
      (opt) => opt.id === predictionOptionId,
    );

    if (!optionBelongsToMatch) {
      throw new BusinessException(
        'Opção de placar inválida para este jogo.',
        'INVALID_PREDICTION_OPTION',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingGuess = await this.userGuessRepository.findOne({
      where: { userId, matchId },
    });

    if (existingGuess) {
      throw new BusinessException(
        'Você já deu um palpite para este jogo.',
        'GUESS_ALREADY_EXISTS',
        HttpStatus.BAD_REQUEST,
      );
    }

    const guess = this.userGuessRepository.create({
      userId,
      matchId,
      predictionOptionId,
    });

    return this.userGuessRepository.save(guess);
  }

  async getOpenMatches(userId: string): Promise<MatchDto[]> {
    const allMatches = await this.matchesService.findAll();
    const openMatches = allMatches.filter(
      (match) => !this.matchesService.isMatchClosed(match),
    );

    const matchDtos: MatchDto[] = [];

    for (const match of openMatches) {
      const guesses = await this.userGuessRepository.find({
        where: { matchId: match.id },
      });

      const countMap = new Map<string, number>();
      guesses.forEach((g) => {
        countMap.set(
          g.predictionOptionId,
          (countMap.get(g.predictionOptionId) || 0) + 1,
        );
      });

      const userGuess = guesses.find((g) => g.userId === userId);

      matchDtos.push({
        id: match.id,
        teamA: match.teamA,
        teamB: match.teamB,
        matchDate: match.matchDate.toISOString(),
        stadium: match.stadium,
        referee: match.referee,
        isClosed: false,
        predictionOptions: match.predictionOptions.map((opt) => ({
          id: opt.id,
          matchId: opt.matchId,
          teamAScore: opt.teamAScore,
          teamBScore: opt.teamBScore,
          guessCount: countMap.get(opt.id) || 0,
        })),
        userGuess: userGuess
          ? {
              id: userGuess.id,
              predictionOptionId: userGuess.predictionOptionId,
              createdAt: userGuess.createdAt.toISOString(),
            }
          : undefined,
      });
    }

    return matchDtos;
  }

  async getMyClosedMatches(userId: string): Promise<MatchDto[]> {
    const userGuesses = await this.userGuessRepository.find({
      where: { userId },
      relations: ['match', 'match.predictionOptions'],
    });

    const closedGuesses = userGuesses.filter((g) =>
      this.matchesService.isMatchClosed(g.match),
    );

    const matchDtos: MatchDto[] = [];

    for (const guess of closedGuesses) {
      const match = guess.match;

      const allGuessesForMatch = await this.userGuessRepository.find({
        where: { matchId: match.id },
      });

      const countMap = new Map<string, number>();
      allGuessesForMatch.forEach((g) => {
        countMap.set(
          g.predictionOptionId,
          (countMap.get(g.predictionOptionId) || 0) + 1,
        );
      });

      matchDtos.push({
        id: match.id,
        teamA: match.teamA,
        teamB: match.teamB,
        matchDate: match.matchDate.toISOString(),
        stadium: match.stadium,
        referee: match.referee,
        isClosed: true,
        predictionOptions: match.predictionOptions.map((opt) => ({
          id: opt.id,
          matchId: opt.matchId,
          teamAScore: opt.teamAScore,
          teamBScore: opt.teamBScore,
          guessCount: countMap.get(opt.id) || 0,
        })),
        userGuess: {
          id: guess.id,
          predictionOptionId: guess.predictionOptionId,
          createdAt: guess.createdAt.toISOString(),
        },
      });
    }

    return matchDtos;
  }
}

// Import BusinessException if missing:
import { BusinessException } from '../common/exceptions/business.exception';
