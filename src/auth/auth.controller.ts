import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '@/users/users.service';
import { Request, Response } from 'express';
import { Gender } from '@/users/user.entity';
import { RegisterDto } from './register-dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const { username, password, birth, gender } = dto;
    const existing = await this.usersService.findByUsername(username);
    if (existing) {
      throw new BadRequestException('Username already exists');
    }
    const user = await this.usersService.create(
      username,
      password,
      new Date(birth),
      gender,
    );
    return {
      id: user.id,
      username: user.username,
      birth: user.birth,
      gender: user.gender,
    };
  }

  @Post('login')
  async login(
    @Body('username') username: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.usersService.findByUsername(username);
    if (!user || !(await this.usersService.validatePassword(user, password))) {
      throw new BadRequestException('Invalid credentials');
    }
    const { accessToken, refreshToken } = this.authService.login(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
    });
    return { accessToken };
  }

  @Post('logout')
  logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    response.cookie('refreshToken', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
    });
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refreshToken'];
    if (!refreshToken) {
      throw new HttpException('Refresh token missing', HttpStatus.UNAUTHORIZED);
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await this.authService.refresh(refreshToken);

    response.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
    });
    return { accessToken: newAccessToken };
  }
}
