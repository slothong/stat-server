import { ApiProperty } from '@nestjs/swagger';
import { Gender } from './user.entity';

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
}
