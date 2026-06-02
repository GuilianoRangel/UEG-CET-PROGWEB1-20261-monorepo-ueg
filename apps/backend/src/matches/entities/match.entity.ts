import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PredictionOption } from './prediction-option.entity';

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

  @Column()
  stadium: string;

  @Column()
  referee: string;

  @Column({ default: false })
  isClosed: boolean;

  @OneToMany(() => PredictionOption, (option) => option.match, { cascade: true })
  options: PredictionOption[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
