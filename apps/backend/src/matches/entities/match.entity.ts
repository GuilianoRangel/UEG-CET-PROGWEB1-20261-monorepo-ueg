import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PredictionOption } from './prediction-option.entity';
import { UserGuess } from '../../guesses/entities/user-guess.entity';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  teamA: string;

  @Column()
  teamB: string;

  @Column()
  matchDate: Date;

  @Column({ nullable: true })
  stadium: string;

  @Column({ nullable: true })
  referee: string;

  @Column({ default: false })
  isClosed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PredictionOption, (option) => option.match, { cascade: true, onDelete: 'CASCADE' })
  predictionOptions: PredictionOption[];

  @OneToMany(() => UserGuess, (guess) => guess.match)
  guesses: UserGuess[];
}
