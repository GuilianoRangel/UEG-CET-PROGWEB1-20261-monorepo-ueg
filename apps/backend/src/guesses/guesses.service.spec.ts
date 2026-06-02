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
  let userGuessRepository: jest.Mocked<Partial<Repository<UserGuess>>>;
  let matchesService: jest.Mocked<Partial<MatchesService>>;

  beforeEach(async () => {
    userGuessRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
    };

    matchesService = {
      findOne: jest.fn(),
      isMatchClosed: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuessesService,
        { provide: getRepositoryToken(UserGuess), useValue: userGuessRepository },
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
      const match = {
        id: 'match-1',
        isClosed: false,
        options: [
          { id: 'opt-1', teamAScore: 2, teamBScore: 1 },
        ],
      } as Match;

      matchesService.findOne.mockResolvedValue(match);
      matchesService.isMatchClosed.mockReturnValue(false);
      userGuessRepository.findOne.mockResolvedValue(null);
      userGuessRepository.save.mockResolvedValue({
        id: 'guess-1',
        userId: 'user-1',
        matchId: 'match-1',
        predictionOptionId: 'opt-1',
        createdAt: new Date(),
      } as any);

      const result = await service.create('user-1', {
        matchId: 'match-1',
        predictionOptionId: 'opt-1',
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('guess-1');
      expect(result.userId).toBe('user-1');
      expect(userGuessRepository.save).toHaveBeenCalled();
    });

    it('should throw BusinessException if user tries to guess twice on the same match', async () => {
      const match = {
        id: 'match-1',
        isClosed: false,
        options: [
          { id: 'opt-1', teamAScore: 2, teamBScore: 1 },
        ],
      } as Match;

      matchesService.findOne.mockResolvedValue(match);
      matchesService.isMatchClosed.mockReturnValue(false);
      userGuessRepository.findOne.mockResolvedValue({ id: 'existing-guess' } as UserGuess);

      await expect(
        service.create('user-1', {
          matchId: 'match-1',
          predictionOptionId: 'opt-1',
        }),
      ).rejects.toThrow(
        new BusinessException('Você já enviou um palpite para este jogo', 'GUESS_ALREADY_EXISTS'),
      );
    });

    it('should throw BusinessException if user tries to guess on a closed match', async () => {
      const match = {
        id: 'match-1',
        isClosed: true,
        options: [
          { id: 'opt-1', teamAScore: 2, teamBScore: 1 },
        ],
      } as Match;

      matchesService.findOne.mockResolvedValue(match);
      matchesService.isMatchClosed.mockReturnValue(true);

      await expect(
        service.create('user-1', {
          matchId: 'match-1',
          predictionOptionId: 'opt-1',
        }),
      ).rejects.toThrow(
        new BusinessException('Não é possível palpitar em um jogo encerrado', 'MATCH_CLOSED'),
      );
    });
  });

  describe('findOpenMatches & guessCounts', () => {
    it('should return guessCounts correctly mapped to predictionOptions', async () => {
      const matches = [
        {
          id: 'match-1',
          teamA: 'Brasil',
          teamB: 'Argentina',
          matchDate: new Date(),
          options: [
            { id: 'opt-1', teamAScore: 2, teamBScore: 1 } as PredictionOption,
            { id: 'opt-2', teamAScore: 1, teamBScore: 0 } as PredictionOption,
          ],
        } as Match,
      ];

      matchesService.findAll.mockResolvedValue(matches);
      matchesService.isMatchClosed.mockReturnValue(false);
      userGuessRepository.findOne.mockResolvedValue(null);
      
      // Return 5 guesses for opt-1 and 3 guesses for opt-2
      userGuessRepository.count.mockImplementation(async (query: any) => {
        if (query.where.predictionOptionId === 'opt-1') return 5;
        if (query.where.predictionOptionId === 'opt-2') return 3;
        return 0;
      });

      const result = await service.findOpenMatches('user-1');
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].options[0].guessCount).toBe(5);
      expect(result[0].options[1].guessCount).toBe(3);
    });
  });
});
