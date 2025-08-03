import { ApiProperty } from '@nestjs/swagger';
import { Comment } from '../../comments/comment.entity';
import { User } from '@/users/user.entity';

export class CommentAuthorDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  avatarUrl?: string;

  constructor(user: User) {
    this.userId = user.id;
    this.username = user.username;
    this.avatarUrl = user.avatarUrl;
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

  @ApiProperty()
  replies: CommentResponseDto[];

  @ApiProperty()
  likedByMe?: boolean;

  @ApiProperty()
  likedByCount: number;

  constructor(comment: Comment, userId?: string) {
    this.id = comment.id;
    this.content = comment.content;
    this.author = new CommentAuthorDto(comment.author);
    this.createdAt = comment.createdAt;
    this.updatedAt = comment.updatedAt;
    this.replies =
      comment.replies?.map(
        (comment) => new CommentResponseDto(comment, userId),
      ) ?? [];
    this.likedByMe = userId
      ? comment.likedBy?.some((user) => user.id === userId)
      : undefined;
    this.likedByCount = comment.likedBy?.length ?? 0;
  }
}
