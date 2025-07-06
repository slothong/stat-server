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

@Controller('polls')
export class PollsController {
  constructor(
    private readonly pollsService: PollsService,
    private readonly votesService: VotesService,
  ) {}

  @ApiResponse({ status: 200, type: [PollSummaryDto] })
  @Get()
  async findAll(@Request() req: AuthRequest): Promise<PollSummaryDto[]> {
    return (await this.pollsService.findAll(req.user?.userId)).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  @ApiResponse({ status: 200, type: PollResponseDto })
  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(
    @Param('id') pollId: string,
    @Request() req: AuthRequest,
  ): Promise<PollResponseDto> {
    const poll = await this.pollsService.findOne(pollId);
    if (req.user) {
      return {
        ...poll,
        hasVoted: await this.votesService.hasVoted(req.user.userId, poll.id),
      };
    }
    return poll;
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
    return { ...poll, hasVoted: false };
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
    };
  }
}
