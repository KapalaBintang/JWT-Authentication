import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Menandai DbService sebagai Injectable, sehingga dapat diinject ke dalam modul lainnya
@Injectable()
// DbService mewarisi semua fungsi dari PrismaClient dan mengimplementasikan OnModuleInit
export class DbService extends PrismaClient implements OnModuleInit {
  // Fungsi ini akan dipanggil saat modul diinisialisasi
  async onModuleInit() {
    // Menghubungkan PrismaClient ke database
    await this.$connect();
  }

  // Fungsi ini dapat digunakan untuk menangani penghentian modul, misalnya saat aplikasi dimatikan
  async onModuleDestroy() {
    // Menutup koneksi PrismaClient ke database
    await this.$disconnect();
  }
}
