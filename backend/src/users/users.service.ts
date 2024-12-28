import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(readonly prisma: DbService) {}

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  async getAll(page: number, limit: number, search: string) {
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

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
