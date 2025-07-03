import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Poll } from './poll.entity';
import { PollsService } from './polls.service';
import { PollsController } from './polls.controller';
import { Option } from '@/options/option.entity';
import { VotesModule } from '@/votes/votes.module';
import { Vote } from '@/votes/vote.entity';
import { User } from '@/users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Poll, Option, Vote, User]), VotesModule],
  providers: [PollsService],
  controllers: [PollsController],
  exports: [PollsService],
})
export class PollsModule {}
