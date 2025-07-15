import { Poll } from '@/polls/poll.entity';
import { Vote } from '@/votes/vote.entity';
import { User } from '@/users/user.entity';
import { VoteService } from '@/votes/votes.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Vote, Poll, User])],
  providers: [VoteService],
  exports: [VoteService],
})
export class VoteModule {}
