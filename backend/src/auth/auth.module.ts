import { Module, Global } from '@nestjs/common'; // Mengimpor dekorator Module dan Global dari NestJS
import { AuthController } from './auth.controller'; // Mengimpor AuthController untuk menangani HTTP requests terkait autentikasi
import { AuthService } from './auth.service'; // Mengimpor AuthService yang berisi logika bisnis autentikasi
import { JwtModule } from '@nestjs/jwt'; // Mengimpor JwtModule untuk menangani JWT (JSON Web Tokens)

@Global() // Menandai module ini sebagai global sehingga bisa digunakan di module lain tanpa perlu impor eksplisit
@Module({
  imports: [JwtModule.register({})], // Mengimpor JwtModule dan mendaftarkan konfigurasi default untuk JWT
  controllers: [AuthController], // Menambahkan AuthController sebagai controller untuk menangani HTTP request
  providers: [AuthService], // Menambahkan AuthService sebagai provider untuk logika autentikasi
})
export class AuthModule {} // Deklarasi dan ekspor AuthModule untuk digunakan di aplikasi
