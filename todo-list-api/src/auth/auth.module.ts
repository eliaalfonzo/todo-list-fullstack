// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: false, // solo para auth
      ttl: 3600,       // tiempo de expiración de tokens en la blacklist (en segundos)
      max: 1000,       // máximo de tokens guardados
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [AuthService],
})
export class AuthModule {}