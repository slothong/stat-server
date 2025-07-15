import { ApiProperty } from '@nestjs/swagger';
import { Poll } from '../poll.entity';
import { User } from '@/users/user.entity';

export class OptionResponseDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  optionText: string;
  @ApiProperty()
  voteCount?: number;
  @ApiProperty()
  votedByMe?: boolean;
}

export class PollCreatedByDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  username: string;

  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
  }
}

export class PollResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  question: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  createdBy: PollCreatedByDto;

  @ApiProperty({ type: [OptionResponseDto] })
  options: OptionResponseDto[];

  @ApiProperty()
  hasVoted?: boolean;

  @ApiProperty()
  likedByCount: number;

  @ApiProperty()
  likedByMe?: boolean;

  @ApiProperty()
  commentCount: number;

  @ApiProperty()
  bookmarkedByMe?: boolean;

  constructor(poll: Poll, userId?: string) {
    const hasVoted = userId
      ? poll.votes?.some((v) => v.user.id === userId)
      : undefined;

    // TODO: 모든 likedBy를 가져오지 않고, likedByCount만 가져오는 방법을 찾아야 함
    const likedByMe = userId
      ? poll.likedBy?.some((u) => u.id === userId)
      : undefined;

    const bookmarkedByMe = userId
      ? poll.bookmarkedBy?.some((u) => u.id === userId)
      : undefined;

    this.id = poll.id;
    this.question = poll.question;
    this.description = poll.description;
    this.createdAt = poll.createdAt;
    this.createdBy = new PollCreatedByDto(poll.createdBy);
    this.options = poll.options.map((option) => ({
      id: option.id,
      optionText: option.optionText,
      voteCount: hasVoted
        ? poll.votes.filter((vote) => vote.option.id === option.id).length
        : undefined,
      votedByMe: hasVoted
        ? !!poll.votes.find(
            (vote) => vote.option.id === option.id && vote.user.id === userId,
          )
        : undefined,
    }));
    this.hasVoted = hasVoted;
    this.likedByCount = poll.likedBy?.length ?? 0;
    this.likedByMe = likedByMe;
    this.commentCount = poll.commentCount ?? poll.comments?.length ?? 0;
    this.bookmarkedByMe = bookmarkedByMe;
  }
}
