import { OptionResponseDto } from '@/options/option-response.dto';
import { UserResponseDto } from '@/users/user-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class PollResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  question: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  createdBy: UserResponseDto;

  @ApiProperty()
  options: OptionResponseDto[];

  @ApiProperty()
  hasVoted?: boolean;
}
