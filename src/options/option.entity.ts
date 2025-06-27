import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Poll } from '@/polls/poll.entity';

@Entity({ name: 'options' })
export class Option {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Poll, (poll) => poll.options, { onDelete: 'CASCADE' })
  poll: Poll;

  @Column({ name: 'option_text', type: 'text' })
  optionText: string;

  @Column({ default: 0 })
  votes: number;
}
