import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Match } from './match.entity';
import { UserGuess } from '../../guesses/entities/user-guess.entity';

@Entity('prediction_options')
export class PredictionOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  matchId: string;

  @Column('int')
  teamAScore: number;

  @Column('int')
  teamBScore: number;

  @ManyToOne(() => Match, (match) => match.predictionOptions, { onDelete: 'CASCADE' })
  match: Match;

  @OneToMany(() => UserGuess, (guess) => guess.predictionOption)
  guesses: UserGuess[];
}
