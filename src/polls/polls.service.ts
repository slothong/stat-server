import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poll } from './poll.entity';
import { CreatePollRequestDto } from './request-dto/create-poll-request-dto';
import { Option } from '@/polls/option.entity';
import { User } from '@/users/user.entity';

@Injectable()
export class PollService {
  constructor(
    @InjectRepository(Poll)
    private readonly pollRepository: Repository<Poll>,
    @InjectRepository(Option)
    private readonly optionRepository: Repository<Option>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Poll[]> {
    const polls = await this.pollRepository
      .createQueryBuilder('poll')
      .leftJoinAndSelect('poll.options', 'option')
      .leftJoinAndSelect('poll.votes', 'vote')
      .leftJoinAndSelect('poll.createdBy', 'createdBy')
      .leftJoinAndSelect('vote.user', 'voteUser')
      .leftJoinAndSelect('vote.option', 'voteOption')
      .leftJoinAndSelect('poll.likedBy', 'likedBy')
      .leftJoinAndSelect('poll.bookmarkedBy', 'bookmarkedBy')
      .loadRelationCountAndMap('poll.commentCount', 'poll.comments') // 댓글 수만 추가
      .getMany();
    return polls;
  }

  async findOne(pollId: string): Promise<Poll> {
    const poll = await this.pollRepository.findOne({
      where: { id: pollId },
      relations: [
        'options',
        'votes',
        'votes.user',
        'votes.option',
        'likedBy',
        'bookmarkedBy',
        'createdBy',
        'comments',
        'comments.author',
      ],
    });
    if (!poll) {
      throw new NotFoundException();
    }
    return poll;
  }

  async getLikedposts(userId: string): Promise<Poll[]> {
    const polls = await this.pollRepository
      .createQueryBuilder('poll')
      .innerJoin('poll.likedBy', 'user', 'user.id = :userId', { userId })
      .leftJoinAndSelect('poll.options', 'option')
      .leftJoinAndSelect('poll.votes', 'vote')
      .leftJoinAndSelect('poll.createdBy', 'createdBy')
      .leftJoinAndSelect('vote.user', 'voteUser')
      .leftJoinAndSelect('vote.option', 'voteOption')
      .leftJoinAndSelect('poll.likedBy', 'likedBy')
      .leftJoinAndSelect('poll.bookmarkedBy', 'bookmarkedBy')
      .loadRelationCountAndMap('poll.commentCount', 'poll.comments') // 댓글 수만 추가
      .orderBy('poll.createdAt', 'DESC')
      .getMany();
    return polls;
  }

  async getBookmarkedPolls(userId: string): Promise<Poll[]> {
    const polls = await this.pollRepository
      .createQueryBuilder('poll')
      .innerJoin('poll.bookmarkedBy', 'user', 'user.id = :userId', { userId })
      .leftJoinAndSelect('poll.options', 'option')
      .leftJoinAndSelect('poll.votes', 'vote')
      .leftJoinAndSelect('poll.createdBy', 'createdBy')
      .leftJoinAndSelect('vote.user', 'voteUser')
      .leftJoinAndSelect('vote.option', 'voteOption')
      .leftJoinAndSelect('poll.likedBy', 'likedBy')
      .leftJoinAndSelect('poll.bookmarkedBy', 'bookmarkedBy')
      .loadRelationCountAndMap('poll.commentCount', 'poll.comments') // 댓글 수만 추가
      .orderBy('poll.createdAt', 'DESC')
      .getMany();
    return polls;
  }

  async create(data: CreatePollRequestDto, userId: string): Promise<Poll> {
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
    const poll = await this.findOne(pollId);
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
    const poll = await this.findOne(pollId);
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

  async bookmarkPoll(pollId: string, userId: string): Promise<Poll> {
    const poll = await this.findOne(pollId);
    if (!poll) {
      throw new NotFoundException(`Poll not found: ${pollId}`);
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    if (
      !poll.bookmarkedBy.some((bookmarkedUser) => bookmarkedUser.id === userId)
    ) {
      poll.bookmarkedBy.push(user);
    }

    return this.pollRepository.save(poll);
  }

  async unbookmarkPoll(pollId: string, userId: string): Promise<Poll> {
    const poll = await this.findOne(pollId);
    if (!poll) {
      throw new NotFoundException(`Poll not found: ${pollId}`);
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    poll.bookmarkedBy = poll.bookmarkedBy.filter(
      (bookmarkedUser) => bookmarkedUser.id !== userId,
    );

    return this.pollRepository.save(poll);
  }
}
