import { ApiProperty } from '@nestjs/swagger';
import { PollResponseDto } from './poll-response-dto';

export class PollListResponseDto {
  @ApiProperty()
  data: PollResponseDto[];
  @ApiProperty()
  nextCursor?: string;
}
