// src/auth/auth.controller.ts
import { Controller, Post, Body, Res, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth') // Agrupa los endpoints en Swagger bajo "Auth"
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // LOGIN
  @ApiOperation({ summary: 'Iniciar sesión y obtener token JWT' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'elia@gmail.com' },
        password: { type: 'string', example: '1234' },
      },
      required: ['email', 'password'],
    },
  })
  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res() res: Response,
  ) {
    const { email, password } = body;

    try {
      const user = await this.authService.validateUser(email, password);
      if (!user) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const token = this.authService.generateToken(user.id_usuario);

      return res.status(200).json({ token });
    } catch {
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // LOGOUT
  @ApiOperation({ summary: 'Cerrar sesión y revocar token JWT' })
  @ApiBearerAuth('JWT-auth') // Indica que requiere token para Swagger
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req, @Res() res: Response) {
    try {
      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        return res.status(400).json({ message: 'No se recibió token' });
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        return res.status(400).json({ message: 'Token inválido' });
      }

      await this.authService.logout(token);

      return res.status(200).json({ message: 'Logout exitoso' });
    } catch {
      return res.status(500).json({ message: 'Error interno al hacer logout' });
    }
  }

  // TEST JWT
  @ApiOperation({ summary: 'Probar si el token JWT es válido' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('test')
  test(@Req() req) {
    return {
      message: 'Token válido',
      user: req.user,
    };
  }
}