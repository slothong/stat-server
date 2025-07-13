import { AuthRequest } from '@/auth/auth-request';
import { PollResponseDto } from '@/polls/dto/poll-response-dto';
import { VoteDto } from '@/polls/dto/vote.dto';
import {
  Request,
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { VotesService } from './votes.service';

@Controller('polls/:pollId/votes')
export class PollsVotesController {
  constructor(private readonly votesService: VotesService) {}

  @ApiBody({ type: [VoteDto] })
  @ApiResponse({ status: 201, type: PollResponseDto })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async vote(
    @Body() voteDto: VoteDto,
    @Param('pollId') pollId: string,
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
