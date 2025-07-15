import { AuthRequest } from '@/auth/auth-request';
import {
  Controller,
  UseGuards,
  Get,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';
import { UsersService } from './users.service';
import { PollService } from '@/polls/polls.service';
import { PollResponseDto } from '@/polls/response-dto/poll-response-dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly pollService: PollService,
  ) {}

  @ApiResponse({ status: 200, type: UserResponseDto })
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMe(@Request() req: AuthRequest): Promise<UserResponseDto> {
    if (!req.user) throw new UnauthorizedException();
    const user = await this.usersService.findByUsername(req.user.username);
    if (!user) {
      throw new UnauthorizedException();
    }
    return new UserResponseDto(user);
  }

  @ApiResponse({ status: 200, type: [PollResponseDto] })
  @UseGuards(AuthGuard('jwt'))
  @Get(':id/liked-polls')
  async getLikedPolls(@Request() req: AuthRequest): Promise<PollResponseDto[]> {
    const userId = req.user?.userId;
    if (userId == null) throw new UnauthorizedException();

    const polls = await this.pollService.getLikedposts(userId);
    return polls.map((poll) => new PollResponseDto(poll, userId));
  }

  @ApiResponse({ status: 200, type: [PollResponseDto] })
  @UseGuards(AuthGuard('jwt'))
  @Get(':id/bookmarked-polls')
  async getBookmarkedPolls(
    @Request() req: AuthRequest,
  ): Promise<PollResponseDto[]> {
    const userId = req.user?.userId;
    if (userId == null) throw new UnauthorizedException();

    const polls = await this.pollService.getBookmarkedPolls(userId);
    return polls.map((poll) => new PollResponseDto(poll, userId));
  }
}
