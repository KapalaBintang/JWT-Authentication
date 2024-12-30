import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DbService } from 'src/db/db.service'; // Prisma service untuk mengakses database
import * as bcrypt from 'bcrypt'; // Untuk hashing password
import { JwtService } from '@nestjs/jwt'; // Untuk manipulasi JWT
import { Request, Response } from 'express'; // Untuk mengatur respons HTTP

@Injectable() // Menandakan bahwa ini adalah service yang dapat di-inject
export class AuthService {
  constructor(
    readonly prisma: DbService, // Dependency injection untuk Prisma
    private jwtService: JwtService, // Dependency injection untuk JwtService
  ) {}

  // Fungsi login
  async signIn(
    data: { email: string; password: string },
    req: Request,
    res: Response,
  ) {
    const refreshToken = req.cookies.refreshToken;

    const findRefreshToken = await this.prisma.refreshToken.findFirst({
      where: { token: refreshToken },
    });

    if (findRefreshToken) {
      await this.prisma.refreshToken.delete({
        where: { id: findRefreshToken.id },
      });
    }
    // Cek apakah user dengan email tersebut ada
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    console.log('existingUser', existingUser);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Cek apakah password cocok
    const passwordMatch = await bcrypt.compare(
      data.password,
      existingUser.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Payload untuk akses dan refresh token
    const accessTokenPayload = {
      id: existingUser.id,
      role: existingUser.role,
    };

    const refreshTokenPayload = {
      id: existingUser.id,
      iat: Math.floor(new Date().getTime() / 1000), // Timestamp saat ini
    };

    // Buat akses token
    const newAccessToken = await this.jwtService.signAsync(accessTokenPayload, {
      expiresIn: '15m',
      secret: process.env.ACCESS_TOKEN_SECRET,
    });

    // Buat refresh token
    const newRefreshToken = await this.jwtService.signAsync(
      refreshTokenPayload,
      {
        expiresIn: '7d',
        secret: process.env.REFRESH_TOKEN_SECRET,
      },
    );

    // Simpan refresh token di database
    await this.prisma.$transaction(async (prisma) => {
      await prisma.refreshToken.deleteMany({
        where: { userId: existingUser.id },
      });
      await prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: existingUser.id,
          issuedAt: new Date(),
        },
      });
    });

    // Simpan refresh token di cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
    });

    // Kembalikan akses token
    return { accessToken: newAccessToken };
  }

  // Fungsi logout
  async logout(req: any, res: Response) {
    // Ambil ID user dari objek request yang telah di-authenticate
    const { id } = req.user as { id: string };

    // Jika tidak ada ID user, lemparkan NotFoundException
    if (!id) {
      throw new NotFoundException('User not found');
    }

    // Ambil refresh token dari cookie
    const refreshToken = req.cookies.refreshToken;

    // Jika refresh token tidak ditemukan, lemparkan NotFoundException
    if (!refreshToken) {
      throw new NotFoundException('Refresh token is not provided');
    }

    // Hapus refresh token dari database berdasarkan user ID dan token
    const deleteRefreshToken = await this.prisma.refreshToken.deleteMany({
      where: { userId: id, token: refreshToken },
    });

    // Jika tidak ada refresh token yang dihapus, lemparkan NotFoundException
    if (deleteRefreshToken.count === 0) {
      throw new NotFoundException('Refresh token not found');
    }

    // Hapus cookie refresh token dari browser
    res.clearCookie('refreshToken');

    // Kembalikan pesan logout sukses
    return { message: 'Logout successful' };
  }

  // Fungsi refresh token
  async refreshToken(req: any, res: Response) {
    // Ambil refresh token dari cookie
    const refreshToken = req.cookies.refreshToken;

    // Jika refresh token tidak ada, lemparkan UnauthorizedException
    if (!refreshToken) {
      throw new UnauthorizedException('Invalid credentials');
    }

    let payload;
    try {
      // Verifikasi refresh token menggunakan secret key
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });
    } catch (error) {
      // Jika verifikasi gagal, lemparkan UnauthorizedException
      throw new UnauthorizedException(error.message || 'Invalid token');
    }

    // Cari refresh token di database, termasuk data user
    const userAndRefreshToken = await this.prisma.refreshToken.findFirst({
      where: { token: refreshToken },
      include: { user: true },
    });

    // Jika refresh token tidak ditemukan di database, lemparkan UnauthorizedException
    if (!userAndRefreshToken) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Pastikan timestamp refresh token di database sesuai dengan payload
    if (
      Math.floor(new Date(userAndRefreshToken.issuedAt).getTime() / 1000) >
      payload.iat
    ) {
      throw new UnauthorizedException('Invalid credentials (replayed)');
    }

    // Buat payload untuk access token baru
    const accessTokenPayload = {
      id: payload.id,
      role: userAndRefreshToken.user.role,
    };

    // Buat payload untuk refresh token baru
    const refreshTokenPayload = {
      id: payload.id,
      iat: Math.floor(new Date().getTime() / 1000),
    };

    // Generate access token baru dengan masa berlaku 15 menit
    const newAccessToken = await this.jwtService.signAsync(accessTokenPayload, {
      expiresIn: '15m',
      secret: process.env.ACCESS_TOKEN_SECRET,
    });

    // Generate refresh token baru dengan masa berlaku 7 hari
    const newRefreshToken = await this.jwtService.signAsync(
      refreshTokenPayload,
      {
        expiresIn: '7d',
        secret: process.env.REFRESH_TOKEN_SECRET,
      },
    );

    // Update refresh token di database dengan token baru dan timestamp baru
    await this.prisma.refreshToken.update({
      where: { id: userAndRefreshToken.id },
      data: { token: newRefreshToken, issuedAt: new Date() },
    });

    // Simpan refresh token baru ke cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
    });

    // Kembalikan access token baru
    return { accessToken: newAccessToken };
  }
}
