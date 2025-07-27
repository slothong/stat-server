import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@/users/user.entity';
import { UsersService } from '@/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  login(user: User) {
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    const payload = await this.jwtService.verifyAsync(refreshToken);

    const user = await this.usersService.findByEmail(payload.email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    const newPayload = { email: user.email, sub: user.id };

    const newAccessToken = this.jwtService.sign(newPayload, {
      expiresIn: '15m',
    });
    const newRefreshToken = this.jwtService.sign(newPayload, {
      expiresIn: '7d',
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
