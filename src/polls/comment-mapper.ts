import { CommentResponseDto } from './dto/comment-response-dto';
import { Comment } from './entities/comment.entity';

export class CommentMapper {
  static toResponseDto(comment: Comment): CommentResponseDto {
    return {
      id: comment.id,
      content: comment.content,
      author: {
        userId: comment.author.id,
        username: comment.author.username,
      },
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }
}
