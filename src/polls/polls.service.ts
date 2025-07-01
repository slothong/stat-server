import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poll } from './poll.entity';
import { CreatePollDto } from './dto/create-poll.dto';
import { Option } from '@/options/option.entity';

@Injectable()
export class PollsService {
  constructor(
    @InjectRepository(Poll)
    private readonly pollRepository: Repository<Poll>,
    @InjectRepository(Option)
    private readonly optionRepository: Repository<Option>,
  ) {}

  findAll(): Promise<Poll[]> {
    return this.pollRepository.find({ relations: ['options'] });
  }

  findOne(id: string): Promise<Poll | null> {
    return this.pollRepository.findOne({
      where: { id },
      relations: ['options'],
    });
  }

  async create(data: CreatePollDto): Promise<Poll> {
    const poll = await this.pollRepository.save(
      this.pollRepository.create({
        question: data.question,
      }),
    );

    const options = await Promise.all(
      data.options.map(async (optionText) =>
        this.optionRepository.save(
          this.optionRepository.create({
            optionText,
            poll,
          }),
        ),
      ),
    );

    poll.options = options;
    return poll;
  }

  async vote(pollId: string, optionId: string) {
    const poll = await this.pollRepository.findOne({
      where: { id: pollId },
      relations: ['options'],
    });
    if (!poll) {
      throw new NotFoundException(`Poll with ${pollId} not found`);
    }

    const option = poll.options.find((option) => option.id === optionId);
    if (!option) {
      throw new BadRequestException(
        `Option with ${optionId} not found in poll ${pollId}`,
      );
    }

    option.votes += 1;

    await this.pollRepository.save(poll);

    return poll;
  }
}
