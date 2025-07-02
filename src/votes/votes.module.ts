import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VotesService } from './votes.service';
import { Poll } from '@/polls/poll.entity';
import { Vote } from './vote.entity';
import { User } from '@/users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Poll, Vote, User])],
  providers: [VotesService],
  exports: [VotesService],
})
export class VotesModule {}
