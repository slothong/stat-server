import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PollsService } from './polls.service';
import { Poll } from './poll.entity';
import { CreatePollDto } from './dto/create-poll.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Get()
  findAll(): Promise<Poll[]> {
    return this.pollsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Poll | null> {
    return this.pollsService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createPollDto: CreatePollDto): Promise<Poll> {
    return this.pollsService.create(createPollDto);
  }
}
