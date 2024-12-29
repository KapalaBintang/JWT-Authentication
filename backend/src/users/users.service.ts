import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(readonly prisma: DbService) {}

  async create(data: Prisma.UserCreateInput) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    console.log('existingUser', existingUser);

    if (existingUser) {
      throw new NotAcceptableException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;
    return this.prisma.user.create({ data });
  }

  // admin
  async getAll(page: number = 1, limit: number = 10, search: string = '') {
    const searchTerm = search
      ? {
          OR: [{ name: { contains: search } }, { email: { contains: search } }],
        }
      : {};

    return this.prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: searchTerm,
    });
  }

  async getById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserProfile(req: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(
    req: any,
    data: { name?: string; email?: string; password?: string },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Jika password ada, lakukan hashing
    if (data.password) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      data.password = hashedPassword; // Tunggu hasil hashing sebelum menyimpannya
    }

    // Melakukan update data
    return this.prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: data.name || user.name,
        email: data.email || user.email,
        password: data.password || user.password,
      },
    });
  }

  // admin
  async update(id: string, data: Prisma.UserUpdateInput) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  // admin
  async delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
