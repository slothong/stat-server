import { Poll } from '@/polls/poll.entity';
import { User } from '@/users/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => Poll, (poll) => poll.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pollId' })
  poll: Poll;

  @Column()
  pollId: string;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column({ nullable: true })
  authorId: string;

  @ManyToOne(() => Comment, (comment) => comment.replies, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Comment;

  @Column({ nullable: true })
  parentId: string;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
