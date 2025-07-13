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
  Query,
} from '@nestjs/common';
import { PollsService } from './polls.service';
import { CreatePollDto } from './dto/create-poll-dto';
import { AuthGuard } from '@nestjs/passport';
import { PollResponseDto } from './dto/poll-response-dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthRequest } from '@/auth/auth-request';
import { VotesService } from '@/polls/votes.service';
import { OptionalJwtAuthGuard } from '@/auth/optional-auth-guard';
import { PollMapper } from './poll-mapper';

@Controller('polls')
export class PollsController {
  constructor(
    private readonly pollsService: PollsService,
    private readonly votesService: VotesService,
  ) {}

  @UseGuards(OptionalJwtAuthGuard)
  @ApiResponse({ status: 200, type: [PollResponseDto] })
  @Get()
  async findAll(
    @Request() req: AuthRequest,
    @Query('userId') queryUserId: string,
  ): Promise<PollResponseDto[]> {
    const polls = (await this.pollsService.findAll()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    if (queryUserId) {
      const myPolls = polls.filter((poll) => poll.createdBy.id === queryUserId);
      if (queryUserId === req.user?.userId) {
        return myPolls.map((poll) =>
          PollMapper.toResponseDto(poll, { userId: queryUserId }),
        );
      }
      return myPolls.map((poll) => PollMapper.toResponseDto(poll));
    }
    const userId = req.user?.userId;
    return polls.map((poll) => PollMapper.toResponseDto(poll, { userId }));
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

    return PollMapper.toResponseDto(poll, { userId });
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
    return PollMapper.toResponseDto(poll, { userId: req.user.userId });
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
    return PollMapper.toResponseDto(poll, { userId: user.userId });
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
    return PollMapper.toResponseDto(poll, { userId: user.userId });
  }
}
