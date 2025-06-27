import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Option } from '@/options/option.entity';

@Entity({ name: 'polls' })
export class Poll {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  question: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Option, (option) => option.poll)
  options: Option[];
}
