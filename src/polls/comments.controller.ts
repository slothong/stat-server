import {
  Controller,
  Get,
  UseGuards,
  Request,
  Param,
  UnauthorizedException,
  Post,
  Body,
} from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { CommentResponseDto } from './dto/comment-response-dto';
import { CreateCommentDto } from './dto/create-comment-dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthRequest } from '@/auth/auth-request';
import { CommentsService } from './comments.service';
import { CommentMapper } from './comment-mapper';

@Controller('polls/:pollId/comments')
export class PollsCommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiResponse({ status: 200, type: [CommentResponseDto] })
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getComments(
    @Request() req: AuthRequest,
    @Param('pollId') pollId: string,
  ): Promise<CommentResponseDto[]> {
    const userId = req.user?.userId;
    const username = req.user?.username;
    if (userId == null || username == null) throw new UnauthorizedException();
    const comments = await this.commentsService.getComments(pollId);
    return comments
      .map((comment) => CommentMapper.toResponseDto(comment))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({ status: 201, type: CommentResponseDto })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createComment(
    @Request() req: AuthRequest,
    @Param('pollId') pollId: string,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    const userId = req.user?.userId;
    const username = req.user?.username;
    if (userId == null || username == null) throw new UnauthorizedException();
    const { content } = createCommentDto;
    const comment = await this.commentsService.createComment(
      pollId,
      userId,
      content,
    );
    return CommentMapper.toResponseDto(comment);
  }
}
