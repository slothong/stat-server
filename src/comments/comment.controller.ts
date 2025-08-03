import { AuthRequest } from '@/auth/auth-request';
import { CommentResponseDto } from '@/polls/response-dto/comment-response-dto';
import {
  Controller,
  Param,
  Post,
  UnauthorizedException,
  UseGuards,
  Request,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse } from '@nestjs/swagger';
import { CommentService } from './comment.service';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentSerivce: CommentService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ status: 201, type: CommentResponseDto })
  @Post(':id/like')
  async likeComment(
    @Param('id') commentId: string,
    @Request() req: AuthRequest,
  ): Promise<CommentResponseDto> {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException();
    }
    const comment = await this.commentSerivce.likeComment(
      commentId,
      user.userId,
    );
    return new CommentResponseDto(comment, user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ status: 200, type: CommentResponseDto })
  @Delete(':id/like')
  async unlikeComment(
    @Param('id') commentId: string,
    @Request() req: AuthRequest,
  ): Promise<CommentResponseDto> {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException();
    }
    const comment = await this.commentSerivce.unlikeComment(
      commentId,
      user.userId,
    );
    return new CommentResponseDto(comment, user.userId);
  }
}
