import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Categories') // Agrupa los endpoints en Swagger bajo "Categories"
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Eliminar una categoría (incluye cascade en tareas)' })
  @ApiBearerAuth('JWT-auth') // Indica que requiere token para Swagger
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.categoriesService.deleteCategory(parseInt(id, 10));
  }
}