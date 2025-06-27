import { Injectable, UseGuards, Request } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@/users/user.entity';
import { AuthRequest } from './auth-request';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  login(user: User) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  @UseGuards(AuthGuard('jwt'))
  getProfile(@Request() req: AuthRequest) {
    return req.user;
  }
}
