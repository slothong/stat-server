import { ApiProperty } from '@nestjs/swagger';

export class OptionResultDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  optionText: string;

  @ApiProperty()
  voteCount: number;

  @ApiProperty()
  votedByMe: boolean;
}

export class PollResultDto {
  @ApiProperty()
  pollId: string;

  @ApiProperty()
  question: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: [OptionResultDto] })
  options: OptionResultDto[];
}
