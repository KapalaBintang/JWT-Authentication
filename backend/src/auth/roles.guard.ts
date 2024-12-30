import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './enum/role.enum'; // Mengimpor enum Role untuk tipe role yang valid
import { ROLES_KEY } from './decorator/roles.decorator'; // Mengimpor konstanta yang digunakan untuk menyimpan key dekorator

// Menandakan bahwa kelas ini adalah service yang dapat diinject ke dalam modul lainnya
@Injectable()
export class RolesGuard implements CanActivate {
  // Menggunakan Reflector untuk mengakses metadata dekorator
  constructor(private reflector: Reflector) {}

  // Implementasi metode canActivate dari CanActivate
  // Fungsi ini digunakan untuk menentukan apakah akses ke handler atau route tertentu diizinkan
  canActivate(context: ExecutionContext): boolean {
    // Mengambil daftar role yang diperlukan dari metadata yang ada pada handler dan kelas
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(), // Mengambil metadata dari handler
      context.getClass(), // Mengambil metadata dari kelas
    ]);

    // Jika tidak ada role yang diperlukan, maka akses diizinkan
    if (!requiredRoles) {
      return true;
    }

    // Mengambil informasi user dari request
    const { user } = context.switchToHttp().getRequest();

    // Memeriksa apakah user memiliki salah satu role yang dibutuhkan
    return requiredRoles.some((role) => user.role?.includes(role));
  }
}
