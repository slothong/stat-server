import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCommentRequestDto {
  @ApiProperty()
  @IsString()
  content: string;
}
