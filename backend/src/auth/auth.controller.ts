import {
  Body,
  Controller,
  Post,
  Response,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in-dto';

@Controller('auth') // Menentukan prefix route '/auth' untuk semua endpoint dalam controller ini
export class AuthController {
  constructor(private readonly authService: AuthService) {} // Menggunakan dependency injection untuk AuthService

  @Post('login') // Menangani POST request ke '/auth/login'
  async signIn(@Body() signInDto: SignInDto, @Request() req, @Response() res) {
    // Memproses data login menggunakan DTO SignInDto
    const result = await this.authService.signIn(signInDto, req, res);
    res.status(200).json(result); // Mengirimkan response dengan status 200 dan hasil login
  }

  @UseGuards(AuthGuard) // Menggunakan guard untuk melindungi endpoint ini
  @Post('logout') // Menangani POST request ke '/auth/logout'
  async logout(@Request() req, @Response() res) {
    const result = await this.authService.logout(req, res); // Memproses logout
    res.status(200).json(result); // Mengirimkan response dengan status 200 dan hasil logout
  }

  @Post('refresh-token') // Menangani POST request ke '/auth/refresh-token'
  async refreshToken(@Request() req, @Response() res) {
    const result = await this.authService.refreshToken(req, res); // Memperbarui token
    res.status(200).json(result); // Mengirimkan response dengan token baru
  }
}
