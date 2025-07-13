import { ApiProperty } from '@nestjs/swagger';

export class CommentAuthorDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  username: string;
}

export class CommentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  author: CommentAuthorDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
