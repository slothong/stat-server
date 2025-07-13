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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
}
