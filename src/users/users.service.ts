import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gender, User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    email: string,
    username: string,
    password: string,
    birth: Date,
    gender: Gender,
  ) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      username,
      password: hashedPassword,
      birth,
      gender,
    });
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async updateUser(
    userId: string,
    userData: {
      avatarUrl?: string;
      about?: string;
      username: string;
    },
  ) {
    await this.userRepository.update(
      {
        id: userId,
      },
      {
        avatarUrl: userData.avatarUrl,
        about: userData.about,
        username: userData.username,
      },
    );
  }
}
