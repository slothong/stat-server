import { ApiProperty } from '@nestjs/swagger';
import { Gender, User } from './user.entity';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  birth: Date;

  @ApiProperty()
  gender: Gender;

  @ApiProperty()
  avatarUrl?: string;

  @ApiProperty()
  about?: string;

  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.createdAt = user.createdAt;
    this.birth = user.birth;
    this.gender = user.gender;
    this.avatarUrl = user.avatarUrl;
    this.about = user.about;
  }
}
