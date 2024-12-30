# JWT Authentication Best Practices

## Overview

This repository demonstrates how to implement **JWT Authentication** in a NestJS application with best practices to ensure security and scalability. It covers the following:

- **JWT Authentication** with user roles and permissions.
- **Authorization** using roles to protect certain endpoints.
- **Validation** and **data integrity** using DTOs and pipes.
- Use of **guards** to secure routes and ensure proper role-based access control.

## JWT Authentication Best Practices

### 1. **Use Strong Secret Keys**

Ensure that the secret key used for signing JWT tokens is strong, unpredictable, and stored securely (not hardcoded). Use environment variables to store secrets:

```env
JWT_SECRET_KEY=your-strong-secret-key
```

````

In your NestJS app, retrieve the secret key from environment variables:

```typescript
import { Injectable } from "@nestjs/common";
import * as jwt from "jsonwebtoken";

@Injectable()
export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET_KEY;

  // ... other methods
}
```

### 2. **Short Token Expiration**

JWT tokens should have short expiration times (e.g., 15-30 minutes). This reduces the risk of token theft. You can set the token expiration time as follows:

```typescript
const token = jwt.sign(payload, this.jwtSecret, { expiresIn: "15m" });
```

### 3. **Use Refresh Tokens**

For user convenience, use **refresh tokens** with long expiration times (e.g., 7 days). The refresh token allows users to obtain new access tokens without re-authenticating.

```typescript
const refreshToken = jwt.sign(payload, this.jwtSecret, { expiresIn: "7d" });
```

Refresh tokens should be stored securely (in **HTTP-only cookies**).

### 4. **Secure Routes with Guards**

Use NestJS guards like `AuthGuard` and `RolesGuard` to protect routes that require authentication and authorization. This ensures that only authenticated users with specific roles can access certain endpoints.

Example of securing routes in your `UsersController`:

```typescript
@UseGuards(AuthGuard, RolesGuard)
@Controller("users")
export class UsersController {
  @Get()
  @Roles(Role.Admin)
  getAll(@Query("page") page: number = 1, @Query("limit") limit: number = 10, @Query("search") search: string = "") {
    return this.usersService.getAll(page, limit, search);
  }

  @Post()
  @Roles(Role.Admin)
  create(@Body(new ValidationPipe({ whitelist: true })) createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // ... other endpoints
}
```

### 5. **Use HTTP-only Cookies for Storing Refresh Tokens**

Store refresh tokens in HTTP-only cookies to prevent XSS attacks from accessing the token. In the `AuthService` or login routes, send the refresh token in the HTTP-only cookie:

```typescript
res.cookie("refresh_token", refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // Only send cookie over HTTPS in production
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
```

### 6. **Handle Token Revocation**

If a refresh token is compromised or when a user logs out, revoke the refresh token to ensure it cannot be used for further authentication. Implement token revocation by storing refresh tokens in a **blacklist** or **database** and check on each request.

### 7. **Implement Logging and Monitoring**

Always log authentication attempts and errors. Monitor failed login attempts, token expiration, and unauthorized access attempts to detect any suspicious activities.

---

## Installation

1. Clone this repository:

   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables (create a `.env` file):

   ```env
   # Port for the application to run on
   PORT=YOUR_PORT
   ```

# URL for connecting to the database

DATABASE_URL=YOUR_DATABASE_URL

# Secret keys for JWT (Access and Refresh tokens)

ACCESS_TOKEN_SECRET=FILL_THIS_AS_YOUR_ACCESS_TOKEN_SECRET
REFRESH_TOKEN_SECRET=FILL_THIS_AS_YOUR_REFRESH_TOKEN_SECRET

# Environment mode (development, production, etc.)

NODE_ENV=development

````

4. Run the application:

```bash
npm run start
```

---

## Social Media Links

You can follow me on my social media platforms:

- [Instagram](https://instagram.com/abdul_aziz_2412)
- [TikTok](https://tiktok.com/@kapala_bintang)
- [LinkedIn](https://www.linkedin.com/in/abdul-aziz-852802280)
- [Website/Portfolio](https://abdul-aziz.my.id)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```

### Penjelasan:

1. **JWT Authentication**:
   - Menyediakan **JWT authentication** yang kuat, menggunakan kunci rahasia yang disimpan di variabel lingkungan.
   - Token akses dibuat dengan waktu kedaluwarsa pendek dan token refresh digunakan dengan waktu kedaluwarsa panjang.
   - Refresh token disimpan dalam **cookie HTTP-only** untuk menghindari XSS.

2. **Keamanan**:
   - Dengan menggunakan **guards** (`AuthGuard` dan `RolesGuard`), setiap endpoint yang perlu otentikasi dan otorisasi dilindungi.
   - **Revokasi token** diimplementasikan untuk mengatasi kasus token yang dicuri atau logout.

3. **Penggunaan Media Sosial**:
   - Menambahkan tautan ke profil media sosial kamu di bagian bawah dokumentasi untuk memudahkan orang menghubungi atau mengikuti kamu.

Jika kamu membutuhkan bantuan lebih lanjut atau penjelasan lainnya, beri tahu saya!
```
