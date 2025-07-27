import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Comment } from '@/comments/comment.entity';
import { Poll } from '@/polls/poll.entity';

export type Gender = 'male' | 'female' | 'other';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  email: string;

  @Column({ length: 50 })
  username: string;

  @Column({ length: 255 })
  password: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ nullable: true })
  about?: string;

  @Column()
  birth: Date;

  @Column({ type: 'enum', enum: ['male', 'female', 'other'], default: 'other' })
  gender: Gender;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @ManyToMany(() => Poll, (poll) => poll.likedBy)
  @JoinTable()
  likedPolls: Poll[];

  @ManyToMany(() => Poll, (poll) => poll.bookmarkedBy)
  @JoinTable()
  bookmarkedPolls: Poll[];
}
