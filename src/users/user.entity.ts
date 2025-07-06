import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

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
}
