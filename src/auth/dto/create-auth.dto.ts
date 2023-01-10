import { IsDate, IsEmail, IsString } from "class-validator";

export class CreateAuthDto {
  @IsString()
  readonly token_id: string;
  @IsDate()
  readonly expire_date: string;
  @IsEmail()
  readonly email: string;
}
