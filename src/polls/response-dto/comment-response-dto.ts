import { ApiProperty } from '@nestjs/swagger';
import { Comment } from '../../comments/comment.entity';
import { User } from '@/users/user.entity';

export class CommentAuthorDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  username: string;

  constructor(user: User) {
    this.userId = user.id;
    this.username = user.username;
  }
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

  constructor(comment: Comment) {
    this.id = comment.id;
    this.content = comment.content;
    this.author = new CommentAuthorDto(comment.author);
    this.createdAt = comment.createdAt;
    this.updatedAt = comment.updatedAt;
  }
}
