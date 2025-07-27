import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Comment } from './comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}
  async getComments(pollId: string): Promise<Comment[]> {
    const comments = await this.commentRepository.find({
      where: {
        pollId,
      },
      relations: ['author', 'poll'],
    });
    return comments;
  }

  async getCommentsByUser(userId: string): Promise<Comment[]> {
    return await this.commentRepository.find({
      where: {
        authorId: userId,
      },
      relations: ['author', 'poll'],
    });
  }

  async createComment(
    pollId: string,
    userId: string,
    content: string,
  ): Promise<Comment> {
    const comment = this.commentRepository.create();
    comment.pollId = pollId;
    comment.authorId = userId;
    comment.content = content;

    const savedComment = await this.commentRepository.save(comment);

    const commentWithAuthor = await this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['author'],
    });
    if (!commentWithAuthor) {
      throw new InternalServerErrorException('Comment not found after saving');
    }

    return commentWithAuthor;
  }
}
