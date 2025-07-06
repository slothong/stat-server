import { ApiProperty } from '@nestjs/swagger';

export class PollCreatedByDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  username: string;
}
