import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { Match } from '../../matches/entities/match.entity';
import { PredictionOption } from '../../matches/entities/prediction-option.entity';

@Entity('user_guesses')
@Unique(['userId', 'matchId'])
export class UserGuess {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  matchId: string;

  @ManyToOne(() => Match, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'matchId' })
  match: Match;

  @Column()
  predictionOptionId: string;

  @ManyToOne(() => PredictionOption, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'predictionOptionId' })
  predictionOption: PredictionOption;

  @CreateDateColumn()
  createdAt: Date;
}
