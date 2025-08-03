import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCommentRequestDto {
  @ApiProperty()
  @IsString()
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ApiProperty()
  @IsString()
  content: string;
}
