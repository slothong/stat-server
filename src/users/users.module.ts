import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UserController } from './users.controller';
import { PollsModule } from '@/polls/polls.module';
import { CommentModule } from '@/comments/comment.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), PollsModule, CommentModule],
  providers: [UsersService],
  controllers: [UserController],
  exports: [UsersService],
})
export class UsersModule {}
