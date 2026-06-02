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
  ) {}

  async create(createMatchDto: CreateMatchDto): Promise<Match> {
    if (createMatchDto.options.length > 4) {
      throw new BusinessException(
        'O jogo pode ter no máximo 4 opções de placar',
        'MATCH_INVALID_OPTIONS_COUNT',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (createMatchDto.options.length < 1) {
      throw new BusinessException(
        'O jogo deve ter pelo menos 1 opção de placar',
        'MATCH_INVALID_OPTIONS_COUNT',
        HttpStatus.BAD_REQUEST,
      );
    }

    const match = new Match();
    match.teamA = createMatchDto.teamA;
    match.teamB = createMatchDto.teamB;
    match.matchDate = new Date(createMatchDto.matchDate);
    match.stadium = createMatchDto.stadium;
    match.referee = createMatchDto.referee;
    match.isClosed = false;

    match.options = createMatchDto.options.map((opt) => {
      const option = new PredictionOption();
      option.teamAScore = opt.teamAScore;
      option.teamBScore = opt.teamBScore;
      return option;
    });

    return this.matchRepository.save(match);
  }

  async update(id: string, updateMatchDto: Partial<CreateMatchDto>): Promise<Match> {
    const match = await this.matchRepository.findOne({
      where: { id },
      relations: ['options'],
    });

    if (!match) {
      throw new BusinessException(
        'Jogo não encontrado',
        'MATCH_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }

    if (updateMatchDto.teamA !== undefined) match.teamA = updateMatchDto.teamA;
    if (updateMatchDto.teamB !== undefined) match.teamB = updateMatchDto.teamB;
    if (updateMatchDto.matchDate !== undefined) match.matchDate = new Date(updateMatchDto.matchDate);
    if (updateMatchDto.stadium !== undefined) match.stadium = updateMatchDto.stadium;
    if (updateMatchDto.referee !== undefined) match.referee = updateMatchDto.referee;

    if (updateMatchDto.options !== undefined) {
      if (updateMatchDto.options.length > 4) {
        throw new BusinessException(
          'O jogo pode ter no máximo 4 opções de placar',
          'MATCH_INVALID_OPTIONS_COUNT',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (updateMatchDto.options.length < 1) {
        throw new BusinessException(
          'O jogo deve ter pelo menos 1 opção de placar',
          'MATCH_INVALID_OPTIONS_COUNT',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Delete existing options
      await this.predictionOptionRepository.delete({ matchId: id });

      match.options = updateMatchDto.options.map((opt) => {
        const option = new PredictionOption();
        option.teamAScore = opt.teamAScore;
        option.teamBScore = opt.teamBScore;
        return option;
      });
    }

    return this.matchRepository.save(match);
  }

  async closeMatch(id: string): Promise<Match> {
    const match = await this.matchRepository.findOne({ where: { id } });
    if (!match) {
      throw new BusinessException(
        'Jogo não encontrado',
        'MATCH_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }

    match.isClosed = true;
    return this.matchRepository.save(match);
  }

  async delete(id: string): Promise<void> {
    const match = await this.matchRepository.findOne({ where: { id } });
    if (!match) {
      throw new BusinessException(
        'Jogo não encontrado',
        'MATCH_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }
    await this.matchRepository.remove(match);
  }

  async findAll(): Promise<Match[]> {
    return this.matchRepository.find({
      relations: ['options'],
      order: { matchDate: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Match> {
    const match = await this.matchRepository.findOne({
      where: { id },
      relations: ['options'],
    });

    if (!match) {
      throw new BusinessException(
        'Jogo não encontrado',
        'MATCH_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }

    return match;
  }

  isMatchClosed(match: Match): boolean {
    return match.isClosed === true || new Date(match.matchDate) < new Date();
  }
}
