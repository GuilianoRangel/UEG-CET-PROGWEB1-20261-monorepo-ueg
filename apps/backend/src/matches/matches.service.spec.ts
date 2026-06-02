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
  let matchRepo: jest.Mocked<Partial<Repository<Match>>>;
  let optionRepo: jest.Mocked<Partial<Repository<PredictionOption>>>;

  beforeEach(async () => {
    matchRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };
    optionRepo = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchesService,
        { provide: getRepositoryToken(Match), useValue: matchRepo },
        { provide: getRepositoryToken(PredictionOption), useValue: optionRepo },
      ],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a match with valid data and up to 4 options', async () => {
      const dto: CreateMatchDto = {
        teamA: 'Brasil',
        teamB: 'Argentina',
        matchDate: new Date(Date.now() + 100000).toISOString(),
        stadium: 'Lusail',
        referee: 'FIFA Ref',
        options: [
          { teamAScore: 2, teamBScore: 1 },
          { teamAScore: 1, teamBScore: 0 }
        ]
      };

      const mockMatch = {
        id: 'match-1',
        teamA: dto.teamA,
        teamB: dto.teamB,
        matchDate: new Date(dto.matchDate),
        stadium: dto.stadium,
        referee: dto.referee,
        isClosed: false,
        predictionOptions: dto.options.map((o, idx) => ({ id: `opt-${idx}`, ...o }))
      };

      matchRepo.create.mockReturnValue(mockMatch as any);
      matchRepo.save.mockResolvedValue(mockMatch as any);

      const result = await service.create(dto);
      expect(result).toBeDefined();
      expect(result.id).toBe('match-1');
      expect(matchRepo.create).toHaveBeenCalled();
      expect(matchRepo.save).toHaveBeenCalled();
    });

    it('should throw BusinessException if options length is greater than 4', async () => {
      const dto: CreateMatchDto = {
        teamA: 'Brasil',
        teamB: 'Argentina',
        matchDate: new Date().toISOString(),
        options: [
          { teamAScore: 1, teamBScore: 0 },
          { teamAScore: 2, teamBScore: 0 },
          { teamAScore: 3, teamBScore: 0 },
          { teamAScore: 4, teamBScore: 0 },
          { teamAScore: 5, teamBScore: 0 }
        ]
      };

      await expect(service.create(dto)).rejects.toThrow(
        new BusinessException('O jogo deve ter entre 1 e 4 opções de placar.', 'INVALID_OPTIONS_LENGTH')
      );
    });

    it('should throw BusinessException if options length is less than 1', async () => {
      const dto: CreateMatchDto = {
        teamA: 'Brasil',
        teamB: 'Argentina',
        matchDate: new Date().toISOString(),
        options: []
      };

      await expect(service.create(dto)).rejects.toThrow(
        new BusinessException('O jogo deve ter entre 1 e 4 opções de placar.', 'INVALID_OPTIONS_LENGTH')
      );
    });
  });

  describe('close', () => {
    it('should close a match manually', async () => {
      const mockMatch = {
        id: 'match-1',
        isClosed: false,
      } as Match;

      matchRepo.findOne.mockResolvedValue(mockMatch);
      matchRepo.save.mockImplementation(async (m) => m as any);

      const result = await service.close('match-1');
      expect(result.isClosed).toBe(true);
      expect(matchRepo.save).toHaveBeenCalledWith(expect.objectContaining({ isClosed: true }));
    });
  });

  describe('isMatchClosed', () => {
    it('should identify match as closed dynamically if isClosed is true', () => {
      const match = {
        isClosed: true,
        matchDate: new Date(Date.now() + 1000000)
      } as Match;

      expect(service.isMatchClosed(match)).toBe(true);
    });

    it('should identify match as closed dynamically if matchDate is in the past', () => {
      const match = {
        isClosed: false,
        matchDate: new Date(Date.now() - 1000)
      } as Match;

      expect(service.isMatchClosed(match)).toBe(true);
    });

    it('should identify match as open if isClosed is false and matchDate is in the future', () => {
      const match = {
        isClosed: false,
        matchDate: new Date(Date.now() + 1000000)
      } as Match;

      expect(service.isMatchClosed(match)).toBe(false);
    });
  });
});
