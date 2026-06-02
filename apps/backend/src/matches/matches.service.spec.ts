import { Test, TestingModule } from '@nestjs/testing';
import { MatchesService } from './matches.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Match } from './entities/match.entity';
import { PredictionOption } from './entities/prediction-option.entity';
import { Repository } from 'typeorm';
import { BusinessException } from '../common/exceptions/business.exception';
import { CreateMatchDto } from './dto/create-match.dto';

describe('MatchesService', () => {
  let service: MatchesService;
  let matchRepository: jest.Mocked<Partial<Repository<Match>>>;
  let optionRepository: jest.Mocked<Partial<Repository<PredictionOption>>>;

  beforeEach(async () => {
    matchRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
    };

    optionRepository = {
      delete: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchesService,
        { provide: getRepositoryToken(Match), useValue: matchRepository },
        { provide: getRepositoryToken(PredictionOption), useValue: optionRepository },
      ],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a match with valid data and up to 4 options', async () => {
      const createMatchDto: CreateMatchDto = {
        teamA: 'Brasil',
        teamB: 'Argentina',
        matchDate: new Date(Date.now() + 86400000).toISOString(),
        stadium: 'Maracanã',
        referee: 'Wilton Sampaio',
        options: [
          { teamAScore: 2, teamBScore: 1 },
          { teamAScore: 1, teamBScore: 0 },
        ],
      };

      const savedMatch = {
        id: 'uuid-1',
        ...createMatchDto,
        matchDate: new Date(createMatchDto.matchDate),
        isClosed: false,
        options: createMatchDto.options.map((opt, i) => ({
          id: `opt-uuid-${i}`,
          matchId: 'uuid-1',
          ...opt,
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      matchRepository.save.mockResolvedValue(savedMatch as any);

      const result = await service.create(createMatchDto);
      expect(result).toBeDefined();
      expect(result.id).toBe('uuid-1');
      expect(result.options?.length).toBe(2);
      expect(matchRepository.save).toHaveBeenCalled();
    });

    it('should throw BusinessException if options length is greater than 4', async () => {
      const createMatchDto: CreateMatchDto = {
        teamA: 'Brasil',
        teamB: 'Argentina',
        matchDate: new Date(Date.now() + 86400000).toISOString(),
        stadium: 'Maracanã',
        referee: 'Wilton Sampaio',
        options: [
          { teamAScore: 2, teamBScore: 1 },
          { teamAScore: 1, teamBScore: 0 },
          { teamAScore: 0, teamBScore: 0 },
          { teamAScore: 1, teamBScore: 2 },
          { teamAScore: 2, teamBScore: 2 }, // 5th option!
        ],
      };

      await expect(service.create(createMatchDto)).rejects.toThrow(
        new BusinessException('O jogo pode ter no máximo 4 opções de placar', 'MATCH_INVALID_OPTIONS_COUNT'),
      );
    });
  });

  describe('closeMatch', () => {
    it('should close a match manually', async () => {
      const existingMatch = {
        id: 'uuid-1',
        teamA: 'Brasil',
        teamB: 'Argentina',
        matchDate: new Date(),
        stadium: 'Maracanã',
        referee: 'Wilton Sampaio',
        isClosed: false,
      } as Match;

      matchRepository.findOne.mockResolvedValue(existingMatch);
      matchRepository.save.mockImplementation(async (match: any) => match);

      const result = await service.closeMatch('uuid-1');
      expect(result.isClosed).toBe(true);
      expect(matchRepository.save).toHaveBeenCalledWith(expect.objectContaining({ isClosed: true }));
    });
  });

  describe('isMatchClosed', () => {
    it('should identify match as closed dynamically if isClosed is true', () => {
      const match = {
        matchDate: new Date(Date.now() + 86400000), // future
        isClosed: true,
      } as Match;

      expect(service.isMatchClosed(match)).toBe(true);
    });

    it('should identify match as closed dynamically if matchDate is in the past', () => {
      const match = {
        matchDate: new Date(Date.now() - 86400000), // past
        isClosed: false,
      } as Match;

      expect(service.isMatchClosed(match)).toBe(true);
    });

    it('should identify match as open if in the future and not closed', () => {
      const match = {
        matchDate: new Date(Date.now() + 86400000), // future
        isClosed: false,
      } as Match;

      expect(service.isMatchClosed(match)).toBe(false);
    });
  });
});
