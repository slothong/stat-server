import { OptionResponseDto } from '@/options/option-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { PollCreatedByDto } from './poll-created-by-dto';

export class PollSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  question: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  createdBy: PollCreatedByDto;

  @ApiProperty({ type: [OptionResponseDto] })
  options: OptionResponseDto[];
}
