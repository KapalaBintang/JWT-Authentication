import { IsString, IsEmail, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Matches(/^\S*$/, {
    message: 'Name should not contain spaces',
  })
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
