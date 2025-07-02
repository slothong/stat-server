import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  NotFoundException,
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

@Controller('polls')
export class PollsController {
  constructor(
    private readonly pollsService: PollsService,
    private readonly votesService: VotesService,
  ) {}

  @Get()
  async findAll(): Promise<PollResponseDto[]> {
    const polls = await this.pollsService.findAll();
    return polls.map((poll) => ({ ...poll, hasVoted: false }));
  }

  @Get(':id')
  async findOne(
    @Param('id') pollId: string,
    @Request() req: AuthRequest,
  ): Promise<PollResponseDto> {
    const poll = await this.pollsService.findOne(pollId);
    if (poll == null) {
      throw new NotFoundException(`Poll with id ${pollId} not found`);
    }
    if (req.user) {
      return {
        ...poll,
        hasVoted: await this.votesService.hasVoted(req.user.id, pollId),
      };
    }
    return poll;
  }

  @ApiBody({ type: [CreatePollDto] })
  @ApiResponse({ status: 201, type: PollResponseDto })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() createPollDto: CreatePollDto): Promise<PollResponseDto> {
    const poll = await this.pollsService.create(createPollDto);
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

    const votes = await this.votesService.findByPoll(pollId, user.id);
    console.log(votes);

    const hasVoted = await this.votesService.hasVoted(user.id, pollId);
    if (hasVoted) {
      throw new BadRequestException('Already voted');
    }
    const poll = await this.votesService.vote(
      pollId,
      voteDto.optionIds,
      user.id,
    );
    return {
      ...poll,
      hasVoted: true,
    };
  }
}
