import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vote } from './vote.entity';
import { Repository } from 'typeorm';
import { Poll } from '@/polls/poll.entity';
import { User } from '@/users/user.entity';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private readonly voteRepository: Repository<Vote>,
    @InjectRepository(Poll)
    private readonly pollRepository: Repository<Poll>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async hasVoted(userId: string, pollId: string) {
    return this.voteRepository.exists({
      where: {
        user: { id: userId },
        poll: { id: pollId },
      },
    });
  }

  async findByPoll(pollId: string, userId: string) {
    return await this.voteRepository.find({
      where: {
        poll: { id: pollId },
        user: { id: userId },
      },
    });
  }

  async vote(pollId: string, optionIds: string[], userId: string) {
    const poll = await this.pollRepository.findOne({
      where: { id: pollId },
      relations: ['options'],
    });
    if (!poll) {
      throw new NotFoundException(`Poll with ${pollId} not found`);
    }
    const pollOptionIds = poll.options.map((option) => option.id);
    if (
      optionIds.length === 0 ||
      optionIds.some((optionId) => !pollOptionIds.includes(optionId))
    ) {
      throw new BadRequestException(
        `Options with [${optionIds.join(', ')}] not found in poll ${pollId}`,
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const votes = poll.options
      .filter((option) => optionIds.includes(option.id)) // ✅ 유효한 옵션만
      .map((option) =>
        this.voteRepository.create({
          poll,
          option,
          user,
        }),
      );
    await this.voteRepository.save(votes);

    return poll;
  }

  countVotesForOption(optionId: string): Promise<number> {
    return this.voteRepository.count({ where: { option: { id: optionId } } });
  }
}
