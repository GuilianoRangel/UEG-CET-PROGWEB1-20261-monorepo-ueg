import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { PredictionOption } from './entities/prediction-option.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { BusinessException } from '../common/exceptions/business.exception';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(PredictionOption)
    private readonly predictionOptionRepository: Repository<PredictionOption>,
  ) { }

  async create(createMatchDto: CreateMatchDto): Promise<Match> {
    this.validateTeams(createMatchDto.teamA, createMatchDto.teamB);
    const { options, matchDate, ...rest } = createMatchDto;

    if (!options || options.length < 1 || options.length > 4) {
      throw new BusinessException(
        'O jogo deve ter entre 1 e 4 opções de placar.',
        'INVALID_OPTIONS_LENGTH',
        HttpStatus.BAD_REQUEST,
      );
    }

    const match = this.matchRepository.create({
      ...rest,
      matchDate: new Date(matchDate),
      isClosed: false,
    });

    const predictionOptions = options.map((opt) =>
      this.predictionOptionRepository.create({
        teamAScore: opt.teamAScore,
        teamBScore: opt.teamBScore,
      }),
    );

    match.predictionOptions = predictionOptions;

    return this.matchRepository.save(match);
  }

  async update(id: string, updateDto: CreateMatchDto): Promise<Match> {
    this.validateTeams(updateDto.teamA, updateDto.teamB);
    const match = await this.findById(id);
    const { options, matchDate, ...rest } = updateDto;

    if (!options || options.length < 1 || options.length > 4) {
      throw new BusinessException(
        'O jogo deve ter entre 1 e 4 opções de placar.',
        'INVALID_OPTIONS_LENGTH',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Update match info
    match.teamA = rest.teamA;
    match.teamB = rest.teamB;
    match.matchDate = new Date(matchDate);
    match.stadium = rest.stadium || '';
    match.referee = rest.referee || '';

    // Delete old prediction options first to avoid orphans
    await this.predictionOptionRepository.delete({ matchId: id });

    // Create new ones
    const predictionOptions = options.map((opt) =>
      this.predictionOptionRepository.create({
        teamAScore: opt.teamAScore,
        teamBScore: opt.teamBScore,
        matchId: id,
      }),
    );

    match.predictionOptions = predictionOptions;

    return this.matchRepository.save(match);
  }

  async close(id: string): Promise<Match> {
    const match = await this.findById(id);
    match.isClosed = true;
    return this.matchRepository.save(match);
  }

  async findAll(): Promise<Match[]> {
    return this.matchRepository.find({
      relations: ['predictionOptions'],
      order: { matchDate: 'ASC' },
    });
  }

  async findById(id: string): Promise<Match> {
    const match = await this.matchRepository.findOne({
      where: { id },
      relations: ['predictionOptions'],
    });

    if (!match) {
      throw new BusinessException(
        'Jogo não encontrado.',
        'MATCH_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }

    return match;
  }

  async delete(id: string): Promise<void> {
    const match = await this.findById(id);
    await this.matchRepository.remove(match);
  }

  isMatchClosed(match: Match): boolean {
    return match.isClosed || new Date() > new Date(match.matchDate);
  }

  private validateTeams(teamA?: string, teamB?: string): void {
    if (!teamA || teamA.trim().length <= 3) {
      throw new BusinessException(
        'O nome do time A deve ter mais de 3 caracteres.',
        'INVALID_TEAM_A_NAME',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!teamB || teamB.trim().length <= 3) {
      throw new BusinessException(
        'O nome do time B deve ter mais de 3 caracteres.',
        'INVALID_TEAM_B_NAME',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
