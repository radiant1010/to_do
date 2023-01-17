import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class SigninDto extends PartialType(CreateUserDto) {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/)
  readonly password: string;
}
