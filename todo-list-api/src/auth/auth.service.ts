// src/auth/auth.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { query } from '../db';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { JWT_SECRET } from '../config';

@Injectable()
export class AuthService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  // Valida usuario y contraseña (login)
  async validateUser(email: string, password: string) {
    const result = await query('SELECT * FROM usuario WHERE email=$1', [email]);
    const user = result.rows[0];
    if (!user) return null;

    const match = await bcrypt.compare(password, user.contrasena);
    if (!match) return null;

    return user;
  }

  // Valida usuario por ID (para JwtAuthGuard)
  async validateUserById(id: number) {
    const result = await query('SELECT * FROM usuario WHERE id_usuario=$1', [id]);
    return result.rows[0] || null;
  }

  // Genera token JWT
  generateToken(userId: number) {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' });
  }

  // LOGOUT: revoca token y lo guarda en cache (blacklist)
  async logout(token: string) {
    // TTL 1 hora (coincide con expiración del JWT)
    await this.cacheManager.set(token, true, 3600);
  }

  // Verifica si un token está revocado
  async isTokenRevoked(token: string) {
    const revoked = await this.cacheManager.get(token);
    return !!revoked;
  }
}