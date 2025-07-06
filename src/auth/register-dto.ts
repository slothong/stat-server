import { IsDateString, IsIn, IsString } from 'class-validator';

export class RegisterDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsDateString()
  birth: string; // ISO string으로 받아서 Date로 변환 가능

  @IsIn(['male', 'female', 'other'])
  gender: 'male' | 'female' | 'other';
}
