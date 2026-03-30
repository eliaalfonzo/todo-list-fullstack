import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { query } from '../db';

@Injectable()
export class CommentsService {
  async createComment(data: {
    taskId: number;
    userId: number;
    contenido: string;
  }) {
    if (!data.contenido || data.contenido.trim() === '') {
      throw new BadRequestException('El comentario no puede estar vacío');
    }

    // Verificar que la tarea exista
    const task = await query(
      'SELECT id_tarea FROM tarea WHERE id_tarea = $1',
      [data.taskId],
    );

    if (!task.rows.length) {
      throw new NotFoundException('La tarea no existe');
    }

    const result = await query(
      `
      INSERT INTO comentario (contenido, id_usuario, id_tarea)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [data.contenido, data.userId, data.taskId],
    );

    return result.rows[0];
  }
}
