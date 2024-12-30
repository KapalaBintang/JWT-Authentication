import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable() // Menandakan bahwa ini adalah service yang dapat di-inject
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {} // Menggunakan dependency injection untuk JwtService

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Mendapatkan request dari context
    const request = context.switchToHttp().getRequest();

    // Mengekstrak token dari header Authorization
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      // Jika tidak ada token, lempar UnauthorizedException
      throw new UnauthorizedException('Token not provided');
    }

    try {
      // Verifikasi token menggunakan JwtService
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.ACCESS_TOKEN_SECRET, // Kunci rahasia untuk memverifikasi token
      });

      // Menyimpan payload token ke dalam request untuk digunakan di endpoint lain
      request['user'] = payload;
    } catch {
      // Jika verifikasi gagal, lempar UnauthorizedException
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Jika semua proses berhasil, return true untuk mengizinkan akses
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    // Memisahkan header Authorization untuk mendapatkan tipe dan token
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    // Jika tipe adalah Bearer, kembalikan tokennya
    return type === 'Bearer' ? token : undefined;
  }
}
