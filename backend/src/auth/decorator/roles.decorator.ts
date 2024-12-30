import { SetMetadata } from '@nestjs/common';
import { Role } from '../enum/role.enum';

// Menetapkan konstanta ROLES_KEY untuk digunakan sebagai key metadata
export const ROLES_KEY = 'roles';

// Fungsi Roles adalah dekorator yang digunakan untuk menetapkan role yang diperlukan pada handler atau kelas
// Fungsi ini menerima argumen variadic (...roles) yang berisi role-role yang diizinkan
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
