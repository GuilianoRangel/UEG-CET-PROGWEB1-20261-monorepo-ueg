import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Match } from './match.entity';

@Entity('prediction_options')
export class PredictionOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  matchId: string;

  @ManyToOne(() => Match, (match) => match.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'matchId' })
  match: Match;

  @Column('integer')
  teamAScore: number;

  @Column('integer')
  teamBScore: number;
}
