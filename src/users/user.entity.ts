import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Comment } from '@/comments/comment.entity';

export type Gender = 'male' | 'female' | 'other';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ length: 255 })
  password: string;

  @Column()
  birth: Date;

  @Column({ type: 'enum', enum: ['male', 'female', 'other'], default: 'other' })
  gender: Gender;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];
}
