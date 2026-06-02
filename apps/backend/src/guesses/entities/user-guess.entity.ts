import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
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

  @Column()
  predictionOptionId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Match, (match) => match.guesses, { onDelete: 'CASCADE' })
  match: Match;

  @ManyToOne(() => PredictionOption, (option) => option.guesses, { onDelete: 'CASCADE' })
  predictionOption: PredictionOption;
}
