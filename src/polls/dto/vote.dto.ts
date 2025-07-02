import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class VoteDto {
  @ApiProperty()
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayNotEmpty()
  optionIds: string[];
}
