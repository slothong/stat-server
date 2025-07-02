import { OptionResponseDto } from '@/options/option-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class PollResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  question: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  options: OptionResponseDto[];

  @ApiProperty()
  hasVoted?: boolean;
}
