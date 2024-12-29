import {
  Injectable,
  InternalServerErrorException,
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

    console.log('Existing user sign in:', existingUser);

    const passwordMatch = await bcrypt.compare(
      data.password,
      existingUser.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessTokenPayload = {
      id: existingUser.id,
      role: existingUser.role,
    };

    const refreshTokenPayload = {
      id: existingUser.id,
      iat: Math.floor(new Date().getTime() / 1000),
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

    // Transaksi untuk memastikan atomisitas
    await this.prisma.$transaction(async (prisma) => {
      // Hapus refresh token lama
      await prisma.refreshToken.deleteMany({
        where: { userId: existingUser.id },
      });

      // Simpan refresh token baru
      await prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: existingUser.id,
          issuedAt: new Date(),
        },
      });
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    console.log('New access token generated:', newAccessToken);
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

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid credentials');
    }

    let payload;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException(error ? error.message : 'Invalid token');
    }

    const userAndRefreshToken = await this.prisma.refreshToken.findFirst({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!userAndRefreshToken) {
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('issuedAt', new Date(userAndRefreshToken.issuedAt).getTime());
    console.log('iat', payload.iat);

    // Bandingkan timestamp iat di payload dengan issuedAt di database
    if (
      Math.floor(new Date(userAndRefreshToken.issuedAt).getTime() / 1000) >
      payload.iat * 1000 // Convert iat ke milidetik
    ) {
      throw new UnauthorizedException('Invalid credentials (replayed)');
    }

    const accessTokenPayload = {
      id: payload.id,
      role: userAndRefreshToken.user.role,
    };

    const refreshTokenPayload = {
      id: payload.id,
      iat: Math.floor(new Date().getTime() / 1000), // Timestamp baru dalam detik
    };

    // Generate access token baru
    const newAccessToken = await this.jwtService.signAsync(accessTokenPayload, {
      expiresIn: '15m',
      secret: process.env.ACCESS_TOKEN_SECRET,
    });

    // Generate refresh token baru
    const newRefreshToken = await this.jwtService.signAsync(
      refreshTokenPayload,
      {
        expiresIn: '7d',
        secret: process.env.REFRESH_TOKEN_SECRET,
      },
    );

    // Update refresh token di database
    const updatedToken = await this.prisma.refreshToken.update({
      where: { id: userAndRefreshToken.id },
      data: {
        token: newRefreshToken,
        issuedAt: new Date(), // Simpan timestamp baru
      },
    });

    if (!updatedToken) {
      throw new InternalServerErrorException('Failed to update refresh token');
    }

    // Simpan refresh token baru di cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: newAccessToken,
    };
  }
}
