import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  ManyToMany,
} from 'typeorm';
import { Option } from '@/options/option.entity';
import { User } from '@/users/user.entity';
import { Comment } from '@/comments/comment.entity';
import { Vote } from '@/votes/vote.entity';

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

  @ManyToMany(() => User, (user) => user.likedPolls)
  likedBy: User[];

  @OneToMany(() => Vote, (vote) => vote.poll, { eager: true })
  votes: Vote[];
}
