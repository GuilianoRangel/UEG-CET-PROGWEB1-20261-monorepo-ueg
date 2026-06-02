import { Test, TestingModule } from '@nestjs/testing';
import { GuessesService } from './guesses.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserGuess } from './entities/user-guess.entity';
import { MatchesService } from '../matches/matches.service';
import { Repository } from 'typeorm';
import { BusinessException } from '../common/exceptions/business.exception';
import { Match } from '../matches/entities/match.entity';
import { PredictionOption } from '../matches/entities/prediction-option.entity';

describe('GuessesService', () => {
  let service: GuessesService;
  let userGuessRepo: jest.Mocked<Partial<Repository<UserGuess>>>;
  let matchesService: jest.Mocked<Partial<MatchesService>>;

  beforeEach(async () => {
    userGuessRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    matchesService = {
      findById: jest.fn(),
      isMatchClosed: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuessesService,
        { provide: getRepositoryToken(UserGuess), useValue: userGuessRepo },
        { provide: MatchesService, useValue: matchesService },
      ],
    }).compile();

    service = module.get<GuessesService>(GuessesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user guess successfully for an open match', async () => {
      const userId = 'user-1';
      const matchId = 'match-1';
      const optionId = 'opt-1';

      const mockMatch = {
        id: matchId,
        isClosed: false,
        predictionOptions: [{ id: optionId, teamAScore: 2, teamBScore: 1 } as PredictionOption],
      } as Match;

      matchesService.findById.mockResolvedValue(mockMatch);
      matchesService.isMatchClosed.mockReturnValue(false);
      userGuessRepo.findOne.mockResolvedValue(null);

      const mockGuess = { id: 'guess-1', userId, matchId, predictionOptionId: optionId };
      userGuessRepo.create.mockReturnValue(mockGuess as any);
      userGuessRepo.save.mockResolvedValue(mockGuess as any);

      const result = await service.create(userId, { matchId, predictionOptionId: optionId });
      expect(result).toBeDefined();
      expect(result.id).toBe('guess-1');
      expect(userGuessRepo.save).toHaveBeenCalled();
    });

    it('should throw BusinessException if user tries to guess twice on the same match', async () => {
      const userId = 'user-1';
      const matchId = 'match-1';
      const optionId = 'opt-1';

      const mockMatch = {
        id: matchId,
        isClosed: false,
        predictionOptions: [{ id: optionId } as PredictionOption],
      } as Match;

      matchesService.findById.mockResolvedValue(mockMatch);
      matchesService.isMatchClosed.mockReturnValue(false);
      userGuessRepo.findOne.mockResolvedValue({ id: 'guess-existing' } as UserGuess);

      await expect(
        service.create(userId, { matchId, predictionOptionId: optionId })
      ).rejects.toThrow(
        new BusinessException('Você já deu um palpite para este jogo.', 'GUESS_ALREADY_EXISTS')
      );
    });

    it('should throw BusinessException if user tries to guess on a closed match', async () => {
      const userId = 'user-1';
      const matchId = 'match-1';
      const optionId = 'opt-1';

      const mockMatch = {
        id: matchId,
        isClosed: true,
      } as Match;

      matchesService.findById.mockResolvedValue(mockMatch);
      matchesService.isMatchClosed.mockReturnValue(true);

      await expect(
        service.create(userId, { matchId, predictionOptionId: optionId })
      ).rejects.toThrow(
        new BusinessException('Não é possível palpitar em um jogo encerrado.', 'MATCH_CLOSED')
      );
    });

    it('should throw BusinessException if prediction option does not belong to the match', async () => {
      const userId = 'user-1';
      const matchId = 'match-1';
      const optionId = 'opt-wrong';

      const mockMatch = {
        id: matchId,
        isClosed: false,
        predictionOptions: [{ id: 'opt-1' } as PredictionOption],
      } as Match;

      matchesService.findById.mockResolvedValue(mockMatch);
      matchesService.isMatchClosed.mockReturnValue(false);
      userGuessRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create(userId, { matchId, predictionOptionId: optionId })
      ).rejects.toThrow(
        new BusinessException('Opção de placar inválida para este jogo.', 'INVALID_PREDICTION_OPTION')
      );
    });
  });
});
