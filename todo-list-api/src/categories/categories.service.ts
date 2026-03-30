import { Injectable, NotFoundException } from '@nestjs/common';
import { query } from '../db';

@Injectable()
export class CategoriesService {

  async deleteCategory(id: number) {
    const result = await query(
      `
      DELETE FROM categoria
      WHERE id_categoria = $1
      RETURNING *
      `,
      [id],
    );

    if (!result.rows.length) {
      throw new NotFoundException('La categoría no existe');
    }

    return {
      message: 'Categoría eliminada correctamente',
      categoria: result.rows[0],
    };
  }
}
