import { PollResponseDto } from './dto/poll-response-dto';
import { Poll } from './entities/poll.entity';

export class PollMapper {
  static toResponseDto(
    poll: Poll,
    extras?: { userId?: string },
  ): PollResponseDto {
    const userId = extras?.userId;
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

    return {
      id: poll.id,
      question: poll.question,
      description: poll.description,
      createdAt: poll.createdAt,
      createdBy: {
        id: poll.createdBy.id,
        username: poll.createdBy.username,
      },
      options: poll.options.map((option) => ({
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
      })),
      hasVoted,
      likedByCount: poll.likedBy?.length ?? 0,
      likedByMe,
      commentCount: poll.commentCount ?? 0,
      bookmarkedByMe,
    };
  }
}
