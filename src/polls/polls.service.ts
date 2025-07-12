import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poll } from './poll.entity';
import { CreatePollDto } from './dto/create-poll.dto';
import { Option } from '@/options/option.entity';
import { Vote } from '@/votes/vote.entity';
import { VotesService } from '@/votes/votes.service';
import { User } from '@/users/user.entity';

@Injectable()
export class PollsService {
  constructor(
    @InjectRepository(Poll)
    private readonly pollRepository: Repository<Poll>,
    @InjectRepository(Option)
    private readonly optionRepository: Repository<Option>,
    @InjectRepository(Vote)
    private readonly voteRepository: Repository<Vote>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly votesService: VotesService,
  ) {}

  async findAll(): Promise<Poll[]> {
    const polls = await this.pollRepository.find({
      relations: ['options', 'votes', 'votes.user', 'votes.option'],
    });
    return polls;
  }

  async findOne(pollId: string): Promise<Poll> {
    const poll = await this.pollRepository.findOne({
      where: { id: pollId },
      relations: ['options', 'votes', 'votes.user', 'votes.option', 'likedBy'],
    });
    if (!poll) {
      throw new NotFoundException();
    }
    return poll;
  }

  async create(data: CreatePollDto, userId: string): Promise<Poll> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException();
    }
    const poll = await this.pollRepository.save(
      this.pollRepository.create({
        question: data.question,
        description: data.description,
        createdBy: user,
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

  async likePoll(pollId: string, userId: string): Promise<Poll> {
    const poll = await this.pollRepository.findOne({
      where: { id: pollId },
      relations: ['likedBy'],
    });
    if (!poll) {
      throw new NotFoundException(`Poll not found: ${pollId}`);
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    if (!poll.likedBy.some((likedUser) => likedUser.id === userId)) {
      poll.likedBy.push(user);
    }

    return this.pollRepository.save(poll);
  }

  async unlikePoll(pollId: string, userId: string): Promise<Poll> {
    const poll = await this.pollRepository.findOne({
      where: { id: pollId },
      relations: ['likedBy'],
    });
    if (!poll) {
      throw new NotFoundException(`Poll not found: ${pollId}`);
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    poll.likedBy = poll.likedBy.filter((likedUser) => likedUser.id !== userId);

    return this.pollRepository.save(poll);
  }
}
