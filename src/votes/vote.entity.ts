import { Poll } from '@/polls/poll.entity';
import { User } from '@/users/user.entity';
import { Option } from '@/polls/option.entity';
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity({ name: 'votes' })
@Unique(['user', 'option'])
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: false })
  user: User;

  @ManyToOne(() => Poll, { eager: false })
  poll: Poll;

  @ManyToOne(() => Option, { eager: false })
  option: Option;

  @CreateDateColumn()
  createdAt: Date;
}
