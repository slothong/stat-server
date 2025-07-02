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

@Controller('users')
export class UsersController {
  @ApiResponse({ status: 200, type: UserResponseDto })
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMe(@Request() req: AuthRequest): UserResponseDto {
    const { user } = req;
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
