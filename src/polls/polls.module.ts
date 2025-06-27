import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Poll } from './poll.entity';
import { PollsService } from './polls.service';
import { PollsController } from './polls.controller';
import { Option } from '@/options/option.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Poll, Option])],
  providers: [PollsService],
  controllers: [PollsController],
  exports: [PollsService],
})
export class PollsModule {}
