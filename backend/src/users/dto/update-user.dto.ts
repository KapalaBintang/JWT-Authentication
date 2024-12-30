import { IsString, IsOptional, IsEmail, Matches } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Matches(/^\S*$/, {
    message: 'Name should not contain spaces',
  })
  name: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  password: string;
}
