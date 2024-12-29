import { Injectable, NotFoundException } from '@nestjs/common';
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
}
