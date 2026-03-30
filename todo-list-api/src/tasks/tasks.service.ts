import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { query } from '../db';

@Injectable()
export class TasksService {
  // Crear tarea
  async createTask(data: {
    nombre: string;
    descripcion?: string;
    storyPoints?: number;
    fechaEntrega?: string;
    assignedTo: number;
    createdBy: number;
  }) {
    // Validar storyPoints
    if (data.storyPoints !== undefined && data.storyPoints < 0) {
      throw new BadRequestException('Story points no puede ser menor a 0');
    }

    // Validar que el usuario asignado exista
    const assignedUser = await query('SELECT id_usuario FROM usuario WHERE id_usuario = $1', [data.assignedTo]);
    if (!assignedUser.rows.length) {
      throw new BadRequestException('Usuario asignado no existe');
    }

    // Preparar fecha de entrega
    let fechaEntrega: string | null = null;
    if (data.fechaEntrega) {
      const fecha = new Date(data.fechaEntrega);
      if (isNaN(fecha.getTime())) {
        throw new BadRequestException('Fecha de entrega inválida');
      }
      fechaEntrega = fecha.toISOString().split('T')[0];
    }

    const sql = `
      INSERT INTO tarea 
        (nombre, descripcion, story_points, estado, fecha_entrega, id_usuario_creador, id_usuario_asignado)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await query(sql, [
      data.nombre,
      data.descripcion || null,
      data.storyPoints ?? null,
      'PENDIENTE',
      fechaEntrega,
      data.createdBy,
      data.assignedTo,
    ]);

    return result.rows[0];
  }

  // Listar tareas con filtros opcionales
  async listTasks(filters?: { assignedTo?: number; estado?: string }) {
    const estadosValidos = [
      'PENDIENTE',
      'EN_PROGRESO',
      'EN_REVISION',
      'COMPLETADO',
    ];

    // Validar estado si viene
    if (filters?.estado !== undefined) {
      if (!estadosValidos.includes(filters.estado)) {
        throw new BadRequestException(
          `Estado inválido. Valores permitidos: ${estadosValidos.join(', ')}`,
        );
      }
    }

    // Validar assignedTo si viene
    if (filters?.assignedTo !== undefined) {
      if (
        typeof filters.assignedTo !== 'number' ||
        Number.isNaN(filters.assignedTo)
      ) {
        throw new BadRequestException(
          'assignedTo debe ser un número válido',
        );
      }
    }

    let sql = 'SELECT * FROM tarea';
    const params: any[] = [];
    const conditions: string[] = [];

    if (filters?.assignedTo !== undefined) {
      params.push(filters.assignedTo);
      conditions.push(`id_usuario_asignado = $${params.length}`);
    }

    if (filters?.estado !== undefined) {
      params.push(filters.estado);
      conditions.push(`estado = $${params.length}`);
    }

    if (conditions.length) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await query(sql, params);
    return result.rows;
  }

  // Actualizar tarea con validaciones extras
  async updateTask(id: number, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    // Validar storyPoints si viene
    if (data.story_points !== undefined && data.story_points < 0) {
      throw new BadRequestException('Story points no puede ser menor a 0');
    }

    // Validar estado si viene
    const estadosValidos = ['PENDIENTE', 'EN_PROGRESO', 'EN_REVISION', 'COMPLETADO'];
    if (data.estado !== undefined && !estadosValidos.includes(data.estado)) {
      throw new BadRequestException(`Estado inválido. Valores permitidos: ${estadosValidos.join(', ')}`);
    }

    // Validar usuario asignado
    if (data.id_usuario_asignado !== undefined) {
      const assignedUser = await query('SELECT id_usuario FROM usuario WHERE id_usuario = $1', [data.id_usuario_asignado]);
      if (!assignedUser.rows.length) {
        throw new BadRequestException('Usuario asignado no existe');
      }
    }

    // Validar fechaEntrega si viene
    if (data.fecha_entrega !== undefined) {
      const fecha = new Date(data.fecha_entrega);
      if (isNaN(fecha.getTime())) {
        throw new BadRequestException('Fecha de entrega inválida');
      }
      data.fecha_entrega = fecha.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    }

    for (const key of [
      'nombre',
      'descripcion',
      'story_points',
      'estado',
      'fecha_entrega',
      'id_usuario_asignado',
    ]) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(data[key]);
        idx++;
      }
    }

    if (!fields.length) {
      throw new BadRequestException('No hay campos para actualizar');
    }

    values.push(id);

    const sql = `
      UPDATE tarea 
      SET ${fields.join(', ')} 
      WHERE id_tarea = $${idx}
      RETURNING *
    `;

    const result = await query(sql, values);

    if (!result.rows.length) {
      throw new NotFoundException('Tarea no encontrada');
    }

    return result.rows[0];
  }

  // Obtener detalles de una tarea
  async getTaskDetails(id: number) {
    const tareaRes = await query(
      `
      SELECT t.*, 
        u1.nombre AS creador_nombre, u1.email AS creador_email,
        u2.nombre AS asignado_nombre, u2.email AS asignado_email
      FROM tarea t
      JOIN usuario u1 ON t.id_usuario_creador = u1.id_usuario
      JOIN usuario u2 ON t.id_usuario_asignado = u2.id_usuario
      WHERE t.id_tarea = $1
      `,
      [id],
    );

    const tarea = tareaRes.rows[0];
    if (!tarea) throw new NotFoundException('Tarea no encontrada');

    const comentariosRes = await query(
      `
      SELECT c.id_comentario, c.contenido, c.fecha_creacion,
        u.nombre AS usuario_nombre, u.email AS usuario_email
      FROM comentario c
      JOIN usuario u ON c.id_usuario = u.id_usuario
      WHERE c.id_tarea = $1
      ORDER BY c.fecha_creacion ASC
      `,
      [id],
    );

    const categoriasRes = await query(
      `
      SELECT cat.id_categoria, cat.nombre, cat.descripcion, cat.color_hex
      FROM tarea_categoria tc
      JOIN categoria cat ON tc.id_categoria = cat.id_categoria
      WHERE tc.id_tarea = $1
      `,
      [id],
    );

    return {
      ...tarea,
      comentarios: comentariosRes.rows,
      categorias: categoriasRes.rows,
    };
  }

  // Asociar categoría a una tarea
  async addCategoryToTask(taskId: number, categoryId: number) {
    const task = await query('SELECT id_tarea FROM tarea WHERE id_tarea = $1', [taskId]);
    if (!task.rows.length) {
      throw new BadRequestException('La tarea no existe');
    }

    const category = await query('SELECT id_categoria FROM categoria WHERE id_categoria = $1', [categoryId]);
    if (!category.rows.length) {
      throw new BadRequestException('La categoría no existe');
    }

    const exists = await query(
      `SELECT 1 FROM tarea_categoria WHERE id_tarea = $1 AND id_categoria = $2`,
      [taskId, categoryId],
    );

    if (exists.rows.length) {
      throw new BadRequestException('La categoría ya está asociada a la tarea');
    }

    await query(
      `INSERT INTO tarea_categoria (id_tarea, id_categoria) VALUES ($1, $2)`,
      [taskId, categoryId],
    );

    return { message: 'Categoría asociada correctamente a la tarea' };
  }

  // Listar categorías NO asociadas a una tarea
  async getCategoriesNotInTask(taskId: number) {
    const task = await query('SELECT id_tarea FROM tarea WHERE id_tarea = $1', [taskId]);

    if (!task.rows.length) {
      throw new NotFoundException('La tarea no existe');
    }

    const result = await query(
      `
      SELECT *
      FROM categoria
      WHERE id_categoria NOT IN (
        SELECT id_categoria
        FROM tarea_categoria
        WHERE id_tarea = $1
      )
      `,
      [taskId],
    );

    return result.rows;
  }
}