import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common'; // Mengimpor berbagai decorator untuk route dan validasi
import { UsersService } from './users.service'; // Mengimpor service untuk logika bisnis terkait user
import { CreateUserDto } from './dto/create-user.dto'; // Mengimpor DTO untuk pembuatan user
import { UpdateUserDto } from './dto/update-user.dto'; // Mengimpor DTO untuk pembaruan user
import { AuthGuard } from 'src/auth/auth.guard'; // Mengimpor guard untuk otentikasi
import { RolesGuard } from 'src/auth/roles.guard'; // Mengimpor guard untuk otorisasi berdasarkan peran
import { Roles } from 'src/auth/decorator/roles.decorator'; // Mengimpor decorator untuk menetapkan peran
import { Role } from 'src/auth/enum/role.enum'; // Mengimpor enum untuk peran
import { Request } from 'express'; // Mengimpor tipe request dari Express

// Menggunakan guards untuk otentikasi dan otorisasi berdasarkan peran
@UseGuards(AuthGuard, RolesGuard)
@Controller('users') // Menandakan bahwa controller ini mengelola endpoint /users
export class UsersController {
  constructor(private readonly usersService: UsersService) {} // Menginjeksi UsersService untuk mengelola logika bisnis

  // Endpoint untuk mendapatkan semua user, hanya dapat diakses oleh admin
  @Get()
  @Roles(Role.Admin) // Hanya admin yang dapat mengakses endpoint ini
  getAll(
    @Query('page') page: number = 1, // Menangkap parameter query untuk pagination
    @Query('limit') limit: number = 10, // Menangkap parameter query untuk jumlah data per halaman
    @Query('search') search: string = '', // Menangkap parameter query untuk pencarian berdasarkan nama atau email
  ) {
    return this.usersService.getAll(page, limit, search); // Mengambil data user dari service
  }

  // Endpoint untuk membuat user baru, hanya dapat diakses oleh admin
  @Post()
  @Roles(Role.Admin) // Hanya admin yang dapat mengakses endpoint ini
  create(
    @Body(new ValidationPipe({ whitelist: true })) createUserDto: CreateUserDto, // Memvalidasi body request menggunakan DTO dan ValidationPipe
  ) {
    return this.usersService.create(createUserDto); // Mengirim data untuk pembuatan user ke service
  }

  // Endpoint untuk mendapatkan profil user yang sedang login, dapat diakses oleh admin dan cashier
  @Get('profile')
  @Roles(Role.Admin, Role.Cashier) // Admin dan cashier dapat mengakses endpoint ini
  getUserProfile(@Req() req: Request) {
    return this.usersService.getUserProfile(req); // Mengambil profil user berdasarkan request
  }

  // Endpoint untuk memperbarui profil user yang sedang login, dapat diakses oleh admin dan cashier
  @Post('update-profile')
  @Roles(Role.Admin, Role.Cashier) // Admin dan cashier dapat mengakses endpoint ini
  updateProfile(
    @Req() req: Request, // Mendapatkan request untuk mengidentifikasi user yang sedang login
    @Body(new ValidationPipe({ whitelist: true })) data: UpdateUserDto, // Memvalidasi data yang masuk menggunakan DTO
  ) {
    return this.usersService.updateProfile(req, data); // Mengirim data untuk pembaruan profil ke service
  }

  // Endpoint untuk mendapatkan user berdasarkan id, hanya dapat diakses oleh admin dan cashier
  @Get(':id')
  @Roles(Role.Admin, Role.Cashier) // Admin dan cashier dapat mengakses endpoint ini
  getById(@Param('id') id: string) {
    return this.usersService.getById(id); // Mengambil data user berdasarkan id
  }

  // Endpoint untuk memperbarui data user berdasarkan id, hanya dapat diakses oleh admin
  @Put(':id')
  @Roles(Role.Admin) // Hanya admin yang dapat mengakses endpoint ini
  update(
    @Param('id') id: string, // Mendapatkan id dari parameter URL
    @Body(new ValidationPipe({ whitelist: true })) updateUserDto: UpdateUserDto, // Memvalidasi data yang masuk menggunakan DTO
  ) {
    return this.usersService.update(id, updateUserDto); // Mengirim data untuk pembaruan user ke service
  }

  // Endpoint untuk menghapus user berdasarkan id, hanya dapat diakses oleh admin
  @Delete(':id')
  @Roles(Role.Admin) // Hanya admin yang dapat mengakses endpoint ini
  delete(@Param('id') id: string) {
    return this.usersService.delete(id); // Menghapus user berdasarkan id
  }
}
