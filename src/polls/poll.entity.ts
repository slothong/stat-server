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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  question: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Option, (option) => option.poll)
  options: Option[];

  @Column('int', { default: 1 })
  maxSelectable: number; // 예: 1이면 단일 선택, 3이면 최대 3개 선택 가능
}
