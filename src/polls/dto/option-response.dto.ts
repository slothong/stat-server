import { ApiProperty } from '@nestjs/swagger';

export class OptionResponseDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  optionText: string;
  @ApiProperty()
  voteCount?: number;
  @ApiProperty()
  votedByMe?: boolean;
}
