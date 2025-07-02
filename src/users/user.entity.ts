import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ unique: true, length: 50 })
  username: string;

  @ApiProperty()
  @Column({ length: 255 })
  password: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
