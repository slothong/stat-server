import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Option } from '@/options/option.entity';
import { User } from '@/users/user.entity';

@Entity({ name: 'polls' })
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
}
