import { Injectable } from '@nestjs/common';
import { Comment } from './comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}
  async getComments(pollId: string): Promise<Comment[]> {
    const comments = await this.commentRepository.find({
      where: {
        pollId,
      },
    });
    return comments;
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
    return await this.commentRepository.save(comment);
  }
}
