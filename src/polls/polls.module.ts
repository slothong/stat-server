import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Poll } from './poll.entity';
import { PollService } from './polls.service';
import { PollsController } from './polls.controller';
import { Option } from '@/polls/option.entity';
import { Vote } from '@/votes/vote.entity';
import { User } from '@/users/user.entity';
import { Comment } from '@/comments/comment.entity';
import { CommentModule } from '@/comments/comment.module';
import { VoteModule } from '@/votes/votes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Poll, Option, Vote, User, Comment]),
    CommentModule,
    VoteModule,
  ],
  providers: [PollService],
  controllers: [PollsController],
  exports: [PollService],
})
export class PollsModule {}
