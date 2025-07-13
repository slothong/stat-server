import {
  IsDateString,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsDateString()
  @IsNotEmpty()
  birth: string; // ISO string으로 받아서 Date로 변환 가능

  @IsIn(['male', 'female', 'other'])
  @IsNotEmpty()
  gender: 'male' | 'female' | 'other';
}
