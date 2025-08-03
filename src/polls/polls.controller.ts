import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  UnauthorizedException,
  Delete,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { PollService } from './polls.service';
import { CreatePollRequestDto } from './request-dto/create-poll-request-dto';
import { AuthGuard } from '@nestjs/passport';
import { PollResponseDto } from './response-dto/poll-response-dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthRequest } from '@/auth/auth-request';
import { VoteService } from '@/votes/votes.service';
import { OptionalJwtAuthGuard } from '@/auth/optional-auth-guard';
import { CommentResponseDto } from './response-dto/comment-response-dto';
import { CommentService } from '@/comments/comments.service';
import { CreateCommentRequestDto } from './request-dto/create-comment-request-dto';
import { VoteRequestDto } from './request-dto/vote-request.dto';
import { PollListResponseDto } from './response-dto/poll-list-response-dto';

@Controller('polls')
export class PollsController {
  constructor(
    private readonly pollService: PollService,
    private readonly commentService: CommentService,
    private readonly votesService: VoteService,
  ) {}

  @UseGuards(OptionalJwtAuthGuard)
  @ApiResponse({ status: 200, type: [PollResponseDto] })
  @Get()
  async findMany(
    @Request() req: AuthRequest,
    @Query('after') after?: string,
    @Query('limit') limit?: number,
    @Query('sort') sort?: string,
    @Query('status') status?: string,
  ): Promise<PollListResponseDto> {
    const userId = req.user?.userId;
    const polls = await this.pollService.findMany({
      limit: limit ?? 10,
      after,
      sort,
      status,
    });
    return {
      data: polls.data.map((poll) => new PollResponseDto(poll, userId)),
      nextCursor: polls.nextCursor,
    };
  }

  @ApiResponse({ status: 200, type: PollResponseDto })
  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(
    @Param('id') pollId: string,
    @Request() req: AuthRequest,
  ): Promise<PollResponseDto> {
    const userId = req.user?.userId;
    const poll = await this.pollService.findOne(pollId);

    return new PollResponseDto(poll, userId);
  }

  @ApiBody({ type: CreatePollRequestDto })
  @ApiResponse({ status: 201, type: PollResponseDto })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(
    @Body() createPollDto: CreatePollRequestDto,
    @Request() req: AuthRequest,
  ): Promise<PollResponseDto> {
    if (!req.user) throw new UnauthorizedException();
    const poll = await this.pollService.create(createPollDto, req.user.userId);
    return new PollResponseDto(poll, req.user.userId);
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
    const poll = await this.pollService.likePoll(pollId, user.userId);
    return new PollResponseDto(poll, user.userId);
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
    const poll = await this.pollService.unlikePoll(pollId, user.userId);
    return new PollResponseDto(poll, user.userId);
  }

  @ApiResponse({ status: 201, type: PollResponseDto })
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/bookmark')
  async bookmarkPoll(
    @Param('id') pollId: string,
    @Request() req: AuthRequest,
  ): Promise<PollResponseDto> {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException();
    }
    const poll = await this.pollService.bookmarkPoll(pollId, user.userId);
    return new PollResponseDto(poll, user.userId);
  }

  @ApiResponse({ status: 200, type: PollResponseDto })
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id/bookmark')
  async unbookmarkPoll(
    @Param('id') pollId: string,
    @Request() req: AuthRequest,
  ): Promise<PollResponseDto> {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException();
    }
    const poll = await this.pollService.unbookmarkPoll(pollId, user.userId);
    return new PollResponseDto(poll, user.userId);
  }

  @ApiResponse({ status: 200, type: [CommentResponseDto] })
  @UseGuards(AuthGuard('jwt'))
  @Get(':id/comments')
  async getComments(
    @Request() req: AuthRequest,
    @Param('id') pollId: string,
  ): Promise<CommentResponseDto[]> {
    const userId = req.user?.userId;
    const email = req.user?.email;
    if (userId == null || email == null) throw new UnauthorizedException();
    const comments = await this.commentService.getComments(pollId);
    return comments.map((comment) => new CommentResponseDto(comment));
  }

  @ApiBody({ type: CreateCommentRequestDto })
  @ApiResponse({ status: 201, type: CommentResponseDto })
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/comments')
  async createComment(
    @Request() req: AuthRequest,
    @Param('id') pollId: string,
    @Body() createCommentDto: CreateCommentRequestDto,
  ): Promise<CommentResponseDto> {
    const userId = req.user?.userId;
    const email = req.user?.email;
    if (userId == null || email == null) throw new UnauthorizedException();
    const { content, parentId } = createCommentDto;
    const comment = await this.commentService.createComment({
      parentId,
      pollId,
      userId,
      content,
    });
    return new CommentResponseDto(comment);
  }

  @ApiBody({ type: [VoteRequestDto] })
  @ApiResponse({ status: 201, type: PollResponseDto })
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/votes')
  async vote(
    @Body() voteDto: VoteRequestDto,
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
    return new PollResponseDto(poll, user.userId);
  }
}
