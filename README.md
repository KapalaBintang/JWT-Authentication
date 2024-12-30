# JWT Authentication Best Practices

This project implements JWT authentication with best practices to ensure security and efficient user management. Below are the key practices and setup instructions.

## JWT Authentication Best Practices

### 1. **Use Strong Secret Keys for JWT Signing**

- Ensure that **ACCESS_TOKEN_SECRET** and **REFRESH_TOKEN_SECRET** are long, random, and kept secure. These values should be stored in environment variables, not hardcoded.
- Example:
  ```env
  ACCESS_TOKEN_SECRET=your_strong_access_token_secret
  REFRESH_TOKEN_SECRET=your_strong_refresh_token_secret
  ```

### 2. **Short Expiry Time for Access Tokens**

- Access tokens should have short expiration times, typically 15 minutes. This minimizes the damage if a token is compromised.

### 3. **Use Refresh Tokens for Persistent Sessions**

- Refresh tokens should be used to issue new access tokens when they expire. These should be securely stored, typically in HTTP-only cookies.

### 4. **Token Revocation**

- Implement token revocation strategies such as using a blacklist or rotating refresh tokens to invalidate old ones.

### 5. **Ensure HTTPS Usage**

- Always use HTTPS to encrypt sensitive data during transmission, including JWT tokens.

### 6. **Avoid Storing JWT in Local Storage**

- Never store JWT tokens in `localStorage` or `sessionStorage` as they are vulnerable to cross-site scripting (XSS) attacks. Prefer storing them in HTTP-only cookies.

---

## Project Setup

### Prerequisites

- Node.js and npm must be installed.

### Installing Dependencies

```bash
git clone https://github.com/KapalaBintang/JWT-Authentication.git
cd backend
npm install
```

### Environment Variables

Create a `.env` file in the root of your project and fill in the following variables:

```env
PORT=YOUR

_PORT
ACCESS_TOKEN_SECRET=your_strong_access_token_secret
REFRESH_TOKEN_SECRET=your_strong_refresh_token_secret
```

### Running the Application

To run the application in development mode:

```bash
npm run start:dev
```

To run the application in production mode:

```bash
npm run start:prod
```

### Testing API Endpoints

You can use tools like **Postman** or **Insomnia** to test the API endpoints:

- **POST** `/auth/login` - Login endpoint
- **GET** `/users` - Get users (admin only)
- **POST** `/users` - Create a new user (admin only)

### Contribution

Feel free to fork and contribute to this project. Make sure to follow best practices for security and coding style.

```

---

Itu adalah kode lengkap untuk JWT authentication di NestJS dan file `README.md` untuk proyek ini.
```
