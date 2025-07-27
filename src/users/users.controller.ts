import { AuthRequest } from '@/auth/auth-request';
import {
  Controller,
  UseGuards,
  Get,
  Request,
  UnauthorizedException,
  Param,
  Patch,
  Body,
  UseInterceptors,
  UploadedFile,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';
import { UsersService } from './users.service';
import { PollService } from '@/polls/polls.service';
import { PollResponseDto } from '@/polls/response-dto/poll-response-dto';
import { OptionalJwtAuthGuard } from '@/auth/optional-auth-guard';
import { CommentResponseDto } from '@/polls/response-dto/comment-response-dto';
import { CommentService } from '@/comments/comments.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('users')
export class UserController {
  constructor(
    private readonly usersService: UsersService,
    private readonly pollService: PollService,
    private readonly commentSerivce: CommentService,
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

  @UseInterceptors(
    FileInterceptor('avatarFile', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          cb(null, `${uuidv4()}${ext}`);
        },
      }),
    }),
  )
  @UseGuards(AuthGuard('jwt'))
  @Patch('me')
  @HttpCode(204)
  async updateMe(
    @Request() req: AuthRequest,
    @Body() updateMeDto: { about?: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!req.user) throw new UnauthorizedException();
    const user = await this.usersService.findByUsername(req.user.username);
    if (!user) throw new UnauthorizedException();
    const avatarUrl = file && `/avatars/${file.filename}`;
    await this.usersService.updateUser(user.id, avatarUrl, updateMeDto.about);
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

  @UseGuards(OptionalJwtAuthGuard)
  @ApiResponse({ status: 200, type: [PollResponseDto] })
  @Get(':id/polls')
  async getPollsBy(@Request() req: AuthRequest, @Param('id') userId: string) {
    const isMe = req.user?.userId === userId;
    const polls = (await this.pollService.getPollsByUser(userId)).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    if (isMe) {
      return polls.map((poll) => new PollResponseDto(poll, userId));
    }
    return polls.map((poll) => new PollResponseDto(poll));
  }

  @ApiResponse({ status: 200, type: [CommentResponseDto] })
  @Get(':id/comments')
  async getCommentsByUser(@Param('id') userId: string) {
    const comments = await this.commentSerivce.getCommentsByUser(userId);
    return comments.map((comment) => new CommentResponseDto(comment));
  }
}
