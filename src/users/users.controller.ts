import { AuthRequest } from '@/auth/auth-request';
import { Controller, UseGuards, Get, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMe(@Request() req: AuthRequest) {
    return req.user;
  }
}
