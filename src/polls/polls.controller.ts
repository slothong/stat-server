import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  UnauthorizedException,
  BadRequestException,
  Delete,
  Query,
} from '@nestjs/common';
import { PollsService } from './polls.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { AuthGuard } from '@nestjs/passport';
import { PollResponseDto } from './dto/poll-response.dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { VoteDto } from './dto/vote.dto';
import { AuthRequest } from '@/auth/auth-request';
import { VotesService } from '@/votes/votes.service';
import { OptionalJwtAuthGuard } from '@/auth/optional-auth-guard';
import { PollSummaryDto } from './dto/poll-summary.dto';
import { CreateCommentDto } from './dto/create-comment-dto';
import { CommentsService } from '@/comments/comments.service';
import { CommentResponseDto } from '@/comments/dto/comment-response-dto';
import { Poll } from './poll.entity';

@Controller('polls')
export class PollsController {
  constructor(
    private readonly pollsService: PollsService,
    private readonly votesService: VotesService,
    private readonly commentsService: CommentsService,
  ) {}

  @ApiResponse({ status: 200, type: [PollSummaryDto] })
  @Get()
  async findAll(
    @Request() req: AuthRequest,
    @Query('userId') queryUserId: string,
  ): Promise<PollSummaryDto[]> {
    if (queryUserId) {
      const polls = (await this.pollsService.findAll())
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .filter((poll) => poll.createdBy.id === queryUserId);
      if (queryUserId === req.user?.userId) {
        return polls.map((poll) => this.mapPollToResponse(poll, queryUserId));
      }
      return polls.map((poll) => this.mapPollToResponse(poll));
    }
    const userId = req.user?.userId;
    const polls = (await this.pollsService.findAll()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    return polls.map((poll) => this.mapPollToResponse(poll, userId));
  }

  @ApiResponse({ status: 200, type: PollResponseDto })
  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(
    @Param('id') pollId: string,
    @Request() req: AuthRequest,
  ): Promise<PollResponseDto> {
    const userId = req.user?.userId;
    const poll = await this.pollsService.findOne(pollId);

    return this.mapPollToResponse(poll, userId);
  }

  @ApiBody({ type: CreatePollDto })
  @ApiResponse({ status: 201, type: PollResponseDto })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(
    @Body() createPollDto: CreatePollDto,
    @Request() req: AuthRequest,
  ): Promise<PollResponseDto> {
    if (!req.user) throw new UnauthorizedException();
    const poll = await this.pollsService.create(createPollDto, req.user.userId);
    return { ...poll, hasVoted: false, likedByCount: 0 };
  }

  @ApiBody({ type: [VoteDto] })
  @ApiResponse({ status: 201, type: PollResponseDto })
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/votes')
  async vote(
    @Body() voteDto: VoteDto,
    @Param('id') pollId: string,
    @Request() req: AuthRequest,
  ): Promise<PollResponseDto> {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    const hasVoted = await this.votesService.hasVoted(user.userId, pollId);
    if (hasVoted) {
      throw new BadRequestException('Already voted');
    }
    const poll = await this.votesService.vote(
      pollId,
      voteDto.optionIds,
      user.userId,
    );
    return {
      ...poll,
      hasVoted: true,
      likedByCount: 0,
    };
  }

  @ApiResponse({ status: 200, type: [CommentResponseDto] })
  @UseGuards(AuthGuard('jwt'))
  @Get(':id/comments')
  async getComments(
    @Request() req: AuthRequest,
    @Param('id') pollId: string,
  ): Promise<CommentResponseDto[]> {
    const userId = req.user?.userId;
    const username = req.user?.username;
    if (userId == null || username == null) throw new UnauthorizedException();
    const comments = await this.commentsService.getComments(pollId);
    return comments
      .map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: {
          userId,
          username,
        },
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({ status: 201, type: CommentResponseDto })
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/comments')
  async createComment(
    @Request() req: AuthRequest,
    @Param('id') pollId: string,
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
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: {
        userId,
        username,
      },
    };
  }

  @ApiResponse({ status: 201, type: PollResponseDto })
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/like')
  async likePoll(
    @Param('id') pollId: string,
    @Request() req: AuthRequest,
  ): Promise<PollResponseDto> {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException();
    }
    const poll = await this.pollsService.likePoll(pollId, user.userId);
    return {
      ...poll,
      hasVoted: await this.votesService.hasVoted(user.userId, poll.id),
      likedByCount: poll.likedBy ? poll.likedBy.length : 0,
    };
  }

  @ApiResponse({ status: 200, type: PollResponseDto })
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id/like')
  async unlikePoll(
    @Param('id') pollId: string,
    @Request() req: AuthRequest,
  ): Promise<PollResponseDto> {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException();
    }
    const poll = await this.pollsService.unlikePoll(pollId, user.userId);
    return {
      ...poll,
      hasVoted: await this.votesService.hasVoted(user.userId, poll.id),
      likedByCount: poll.likedBy ? poll.likedBy.length : 0,
    };
  }

  private mapPollToResponse(poll: Poll, userId?: string): PollResponseDto {
    const likedByCount = poll.likedBy?.length ?? 0;
    const votedByMe = poll.votes?.some((v) => v.user.id === userId);

    const dto = {
      ...poll,
      hasVoted: userId
        ? poll.votes?.some((v) => v.user.id === userId)
        : undefined,
      likedByCount,
      likedByMe: userId
        ? poll.likedBy?.some((user) => user.id === userId)
        : false,
    };
    if (votedByMe) {
      return {
        ...dto,
        options: dto.options.map((option) => ({
          ...option,
          voteCount: poll.votes.filter((vote) => vote.option.id === option.id)
            .length,
          votedByMe: !!poll.votes.find(
            (vote) => vote.option.id === option.id && vote.user.id === userId,
          ),
        })),
      };
    }
    return dto;
  }
}
