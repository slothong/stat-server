import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Poll } from '@/polls/entities/poll.entity';
import { Vote } from '@/polls/entities/vote.entity';

@Entity({ name: 'options' })
export class Option {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Poll, (poll) => poll.options, { onDelete: 'CASCADE' })
  poll: Poll;

  @Column({ type: 'text' })
  optionText: string;

  @OneToMany(() => Vote, (vote) => vote.option, { eager: true })
  votes: Vote[];
}
