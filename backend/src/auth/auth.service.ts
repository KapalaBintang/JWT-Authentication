import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DbService } from 'src/db/db.service';
// import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    readonly prisma: DbService,
    private jwtService: JwtService,
  ) {}

  async signIn(data: { email: string; password: string }, res: Response) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    console.log('existing user sign in', existingUser);

    const passwordMatch = await bcrypt.compare(
      data.password,
      existingUser?.password,
    );

    console.log('passwordMatch', passwordMatch);

    if (!passwordMatch) {
      throw new NotFoundException('Wrong password');
    }

    const accessTokenPayload = {
      id: existingUser.id,
      role: existingUser.role,
    };

    const refreshTokenPayload = {
      id: existingUser.id,
    };

    const newAccessToken = await this.jwtService.signAsync(accessTokenPayload, {
      expiresIn: '15m',
      secret: process.env.ACCESS_TOKEN_SECRET,
    });

    const newRefreshToken = await this.jwtService.signAsync(
      refreshTokenPayload,
      {
        expiresIn: '7d',
        secret: process.env.REFRESH_TOKEN_SECRET,
      },
    );

    await this.prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: existingUser.id,
      },
    });

    console.log('newRefreshToken', newRefreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log('newAccessToken', newAccessToken);
    return {
      accessToken: newAccessToken,
    };
  }

  async logout(req: any, res: Response) {
    console.log('req.user', req.user);

    const { id } = req.user as { id: string };

    if (!id) {
      throw new NotFoundException('User not found');
    }

    const refreshToken: string = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new NotFoundException('Refresh token is not provided');
    }
    const deleteRefreshToken = await this.prisma.refreshToken.deleteMany({
      where: {
        userId: id,
        token: refreshToken,
      },
    });

    console.log('deleteRefreshToken', deleteRefreshToken);

    if (deleteRefreshToken.count === 0) {
      throw new NotFoundException('Refresh token not found');
    }

    res.clearCookie('refreshToken');

    return {
      message: 'Logout successful',
    };
  }

  async refreshToken(req: any, res: Response) {
    const refreshToken = req.cookies.refreshToken;

    // Cek apakah refresh token disediakan di cookie
    if (!refreshToken) {
      throw new UnauthorizedException('Invalid credentials'); // Jangan beri detail berlebih pada respon error
    }

    let payload;
    try {
      // Verifikasi refresh token menggunakan secret yang sesuai
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });
    } catch (error) {
      // Token tidak valid atau kadaluarsa
      throw new UnauthorizedException(error ? error.message : 'Invalid token');
    }

    // Cari refresh token di database untuk validasi tambahan
    const userAndRefreshToken = await this.prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
      },
      include: {
        user: true, // Termasuk data user untuk digunakan di payload
      },
    });

    // Jika token tidak ditemukan di database, respon dengan UnauthorizedException
    if (!userAndRefreshToken) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validasi apakah refresh token adalah replay (issuedAt di database lebih baru dari yang ada di payload)
    if (
      new Date(userAndRefreshToken.issuedAt).getTime() >
      payload.iat * 1000 // Convert issued-at dari payload ke milidetik
    ) {
      throw new UnauthorizedException('Invalid credentials (replayed)');
    }

    // Buat payload baru untuk access token
    const accessTokenPayload = {
      id: payload.id, // ID user dari payload refresh token
      role: payload.role, // Role user dari payload refresh token
    };

    // Buat payload baru untuk refresh token dengan issued-at timestamp baru
    const refreshTokenPayload = {
      id: payload.id,
      iat: Math.floor(Date.now() / 1000), // Timestamp baru dalam detik
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
      where: {
        id: userAndRefreshToken.id, // Menggunakan ID token untuk mengupdate token yang sesuai
      },
      data: {
        token: newRefreshToken,
        issuedAt: new Date(), // Timestamp baru untuk validasi replay attack
      },
    });

    // Simpan refresh token baru di cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true, // Hanya bisa diakses melalui HTTP (tidak dapat diakses oleh JavaScript)
      secure: process.env.NODE_ENV === 'production', // Hanya gunakan secure di lingkungan production
      maxAge: 7 * 24 * 60 * 60 * 1000, // Masa berlaku cookie dalam milidetik (7 hari)
    });

    // Return access token baru untuk client
    return {
      accessToken: newAccessToken,
    };
  }
}
