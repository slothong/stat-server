import {
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
import { PollResponseDto } from './dto/poll-response.dto';
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

  async findAll(userId?: string): Promise<PollResponseDto[]> {
    const polls = await this.pollRepository.find({ relations: ['options'] });
    if (userId == null) return polls;

    return await Promise.all(
      polls.map(async (poll) => {
        const hasVoted = await this.votesService.hasVoted(userId, poll.id);
        return {
          ...poll,
          hasVoted,
          createdBy: poll.createdBy && {
            id: poll.createdBy.id,
            username: poll.createdBy.username,
            createdAt: poll.createdBy.createdAt,
          },
        };
      }),
    );
  }

  async findOne(pollId: string, userId?: string): Promise<PollResponseDto> {
    const userVotes = await this.voteRepository.find({
      where: {
        poll: { id: pollId },
        user: { id: userId },
      },
      relations: ['option'],
    });
    const voteCounts: { optionId: string; count: string }[] =
      await this.voteRepository
        .createQueryBuilder('vote')
        .select('vote.option_id', 'optionId')
        .addSelect('COUNT(*)', 'count')
        .where('vote.poll_id = :pollId', { pollId })
        .groupBy('vote.option_id')
        .getRawMany();
    const votedOptionIds = new Set(userVotes.map((v) => v.option.id));
    const countMap: Record<string, number> = Object.fromEntries(
      voteCounts.map((v) => [v.optionId, Number(v.count)]),
    );
    const poll = await this.pollRepository.findOne({
      where: { id: pollId },
      relations: ['options'],
    });
    if (!poll) {
      throw new NotFoundException();
    }
    return {
      id: poll.id,
      question: poll.question,
      options: poll.options.map((opt) => ({
        id: opt.id,
        optionText: opt.optionText,
        votes: countMap[opt.id] ?? 0,
        votedByMe: votedOptionIds.has(opt.id),
      })),
      hasVoted:
        userId == null
          ? false
          : await this.votesService.hasVoted(userId, pollId),
      createdAt: poll.createdAt,
      createdBy: poll.createdBy && {
        id: poll.createdBy.id,
        username: poll.createdBy.username,
        createdAt: poll.createdBy.createdAt,
      },
    };
  }

  async create(data: CreatePollDto, userId: string): Promise<PollResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException();
    }
    const poll = await this.pollRepository.save(
      this.pollRepository.create({
        question: data.question,
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
    return {
      ...poll,
      createdBy: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt,
      },
    };
  }
}
