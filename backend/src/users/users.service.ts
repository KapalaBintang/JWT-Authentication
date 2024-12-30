import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common'; // Mengimpor decorator dan exception dari NestJS
import { DbService } from 'src/db/db.service'; // Mengimpor DbService untuk berinteraksi dengan database
import { Prisma } from '@prisma/client'; // Mengimpor tipe Prisma untuk definisi model
import * as bcrypt from 'bcrypt'; // Mengimpor bcrypt untuk melakukan hashing password

@Injectable() // Menandai UsersService sebagai service yang dapat di-inject di module lain
export class UsersService {
  constructor(readonly prisma: DbService) {} // Mendapatkan akses ke DbService untuk berinteraksi dengan Prisma

  // Fungsi untuk membuat user baru
  async create(data: Prisma.UserCreateInput) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email }, // Mencari user berdasarkan email
    });

    console.log('existingUser', existingUser); // Menampilkan user yang ditemukan di konsol

    if (existingUser) {
      // Jika user dengan email yang sama sudah ada, lempar NotAcceptableException
      throw new NotAcceptableException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10); // Hashing password dengan bcrypt
    data.password = hashedPassword; // Menyimpan password yang sudah di-hash
    return this.prisma.user.create({ data }); // Membuat user baru dengan data yang diberikan
  }

  // Fungsi untuk mendapatkan user berdasarkan id
  async getById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id }, // Mencari user berdasarkan id
    });

    if (!user) {
      // Jika user tidak ditemukan, lempar NotFoundException
      throw new NotFoundException('User not found');
    }

    return user; // Mengembalikan data user
  }

  // Fungsi untuk mendapatkan profil user yang sedang login
  async getUserProfile(req: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id }, // Mencari user berdasarkan id yang terdapat pada request
    });

    if (!user) {
      // Jika user tidak ditemukan, lempar NotFoundException
      throw new NotFoundException('User not found');
    }

    return user; // Mengembalikan profil user
  }

  // Fungsi untuk mengupdate profil user yang sedang login
  async updateProfile(
    req: any,
    data: { name?: string; email?: string; password?: string },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id }, // Mencari user berdasarkan id yang terdapat pada request
    });

    if (!user) {
      // Jika user tidak ditemukan, lempar NotFoundException
      throw new NotFoundException('User not found');
    }

    // Jika password ada, lakukan hashing terlebih dahulu
    if (data.password) {
      const hashedPassword = await bcrypt.hash(data.password, 10); // Hash password
      data.password = hashedPassword; // Menyimpan password yang sudah di-hash
    }

    // Melakukan update profil user
    const updatedUser = await this.prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: data.name || user.name, // Mengupdate nama, jika tidak ada data nama baru gunakan nama lama
        email: data.email || user.email, // Mengupdate email, jika tidak ada data email baru gunakan email lama
        password: data.password || user.password, // Mengupdate password, jika tidak ada data password baru gunakan password lama
      },
    });

    return updatedUser; // Mengembalikan data user yang telah diperbarui
  }

  // Fungsi admin untuk mendapatkan semua user
  async getAll(page: number = 1, limit: number = 10, search: string = '') {
    const searchTerm = search
      ? {
          OR: [{ name: { contains: search } }, { email: { contains: search } }], // Mencari user berdasarkan nama atau email
        }
      : {};

    return this.prisma.user.findMany({
      skip: (page - 1) * limit, // Mengatur pagination berdasarkan page dan limit
      take: limit, // Mengambil sejumlah data sesuai dengan limit
      where: searchTerm, // Menambahkan kondisi pencarian jika ada
    });
  }

  // Fungsi admin untuk mengupdate data user
  async update(id: string, data: Prisma.UserUpdateInput) {
    const user = await this.prisma.user.findUnique({
      where: { id }, // Mencari user berdasarkan id
    });

    if (!user) {
      // Jika user tidak ditemukan, lempar NotFoundException
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.update({
      where: { id },
      data, // Mengupdate data user dengan data yang diberikan
    });
  }

  // Fungsi admin untuk menghapus user
  async delete(id: string) {
    return this.prisma.user.delete({
      where: { id }, // Menghapus user berdasarkan id
    });
  }
}
