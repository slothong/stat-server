import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  ManyToMany,
  RelationCount,
  VirtualColumn,
} from 'typeorm';
import { Option } from '@/polls/entities/option.entity';
import { User } from '@/users/user.entity';
import { Comment } from '@/polls/entities/comment.entity';
import { Vote } from '@/polls/entities/vote.entity';

@Entity('polls')
export class Poll {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  question: string;

  @Column('text')
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { eager: true })
  createdBy: User;

  @OneToMany(() => Option, (option) => option.poll)
  options: Option[];

  @Column('int', { default: 1 })
  maxSelectable: number; // 예: 1이면 단일 선택, 3이면 최대 3개 선택 가능

  @OneToMany(() => Comment, (comment) => comment.poll)
  comments: Comment[];

  commentCount?: number;

  @ManyToMany(() => User, (user) => user.likedPolls)
  likedBy: User[];

  @OneToMany(() => Vote, (vote) => vote.poll, { eager: true })
  votes: Vote[];
}
