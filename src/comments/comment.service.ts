import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Comment } from './comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/users/user.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async getComments(pollId: string): Promise<Comment[]> {
    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('comment.poll', 'poll')
      .leftJoinAndSelect('comment.replies', 'reply')
      .leftJoinAndSelect('comment.likedBy', 'likedBy')
      .leftJoinAndSelect('reply.author', 'replyAuthor')
      .leftJoinAndSelect('reply.likedBy', 'replyLikedBy')
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
      relations: ['author', 'poll', 'likedBy', 'replies'],
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

  async likeComment(commentId: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: {
        id: commentId,
      },
      relations: ['likedBy', 'author'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment not found: ${commentId}`);
    }

    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    if (!comment.likedBy.some((likedUser) => likedUser.id === userId)) {
      comment.likedBy.push(user);
    }

    return this.commentRepository.save(comment);
  }

  async unlikeComment(commentId: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: {
        id: commentId,
      },
      relations: ['likedBy', 'author'],
    });

    if (!comment) {
      throw new NotFoundException(`Commeent not found: ${commentId}`);
    }

    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    comment.likedBy = comment.likedBy.filter((user) => user.id !== userId);
    return this.commentRepository.save(comment);
  }
}
