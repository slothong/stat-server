import { User } from '@/users/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class PollCreatedByDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  username: string;

  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
  }
}
