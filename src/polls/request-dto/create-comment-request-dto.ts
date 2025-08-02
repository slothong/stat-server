import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateCommentRequestDto {
  @ApiProperty()
  @IsString()
  @IsUUID()
  parentId?: string;

  @ApiProperty()
  @IsString()
  content: string;
}
