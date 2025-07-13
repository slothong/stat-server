import {
  Controller,
  Get,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { PollResponseDto } from './dto/poll-response-dto';
import { PollsService } from './polls.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthRequest } from '@/auth/auth-request';

@Controller('users')
export class UserPollsController {
  constructor(private readonly pollService: PollsService) {}

  @ApiResponse({ status: 200, type: [PollResponseDto] })
  @UseGuards(AuthGuard('jwt'))
  @Get(':id/liked-polls')
  async getLikedPosts(@Request() req: AuthRequest): Promise<PollResponseDto[]> {
    const userId = req.user?.userId;
    if (userId == null) throw new UnauthorizedException();

    const polls = await this.pollService.getLikedposts(userId);
    return polls.map((poll) => new PollResponseDto(poll, userId));
  }
}
