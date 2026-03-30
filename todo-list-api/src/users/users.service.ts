import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class UsersService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
  }

  async findAll() {
    const result = await this.pool.query(
      'SELECT id_usuario, nombre FROM usuario ORDER BY nombre ASC'
    );
    return result.rows;
  }
}