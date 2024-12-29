import {
  Body,
  Controller,
  Post,
  // Res,
  Response,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in-dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async signIn(@Body() signInDto: SignInDto, @Response() res) {
    const result = await this.authService.signIn(signInDto, res);

    res.status(200).json(result);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Request() req, @Response() res) {
    const result = await this.authService.logout(req, res);

    res.status(200).json(result);
  }
}
