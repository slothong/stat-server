import { OptionResponseDto } from '@/polls/dto/option-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { PollCreatedByDto } from './poll-created-by-dto';

export class PollResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  question: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  createdBy: PollCreatedByDto;

  @ApiProperty({ type: [OptionResponseDto] })
  options: OptionResponseDto[];

  @ApiProperty()
  hasVoted?: boolean;

  @ApiProperty()
  likedByCount: number;

  @ApiProperty()
  likedByMe?: boolean;

  @ApiProperty()
  commentCount: number;
}
