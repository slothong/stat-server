import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
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
    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('comment.poll', 'poll')
      .leftJoinAndSelect('comment.replies', 'reply')
      .leftJoinAndSelect('reply.author', 'replyAuthor')
      .where('comment.pollId = :pollId', { pollId })
      .andWhere('comment.parent_id IS NULL')
      .orderBy('comment.createdAt', 'DESC')
      .addOrderBy('reply.createdAt', 'DESC')
      .getMany();
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

  async createComment({
    parentId,
    pollId,
    userId,
    content,
  }: {
    parentId?: string;
    pollId: string;
    userId: string;
    content: string;
  }): Promise<Comment> {
    const comment = this.commentRepository.create();
    comment.pollId = pollId;
    comment.authorId = userId;
    comment.content = content;

    if (parentId) {
      const parent = await this.commentRepository.findOne({
        where: {
          id: parentId,
        },
      });
      if (parent == null)
        throw new BadRequestException(`Invalid parent comment ID: ${parentId}`);
      comment.parent = parent;
    }

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
