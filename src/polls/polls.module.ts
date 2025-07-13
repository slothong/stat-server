import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Poll } from './entities/poll.entity';
import { PollsService } from './polls.service';
import { PollsController } from './polls.controller';
import { Option } from '@/polls/entities/option.entity';
import { Vote } from '@/polls/entities/vote.entity';
import { User } from '@/users/user.entity';
import { Comment } from '@/polls/entities/comment.entity';
import { CommentsService } from './comments.service';
import { PollsCommentsController } from './comments.controller';
import { PollsVotesController } from './votes.controller';
import { VotesService } from './votes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Poll, Option, Vote, User, Comment])],
  providers: [PollsService, CommentsService, VotesService],
  controllers: [PollsController, PollsCommentsController, PollsVotesController],
  exports: [PollsService],
})
export class PollsModule {}
