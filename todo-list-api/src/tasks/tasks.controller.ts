import { Controller, Post, Body, Req, Get, Query, Param, UseGuards, BadRequestException, Put } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('Tasks') // Categoría en Swagger
@ApiBearerAuth('JWT-auth') // Indica que requiere JWT
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // Crear tarea
  @ApiOperation({ summary: 'Crear una nueva tarea' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nombre: { type: 'string', example: 'Programación Orientada a Objetos' },
        descripcion: { type: 'string', example: 'Realizar una Infografía sobre la POO' },
        storyPoints: { type: 'number', example: 5 },
        fechaEntrega: { type: 'string', example: '2026-02-15' },
        assignedTo: { type: 'number', example: 1 },
      },
      required: ['nombre', 'assignedTo'],
    },
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: any, @Req() req: any) {
    if (!body.nombre || !body.assignedTo) {
      throw new BadRequestException(
        'nombre y assignedTo son obligatorios',
      );
    }

    const userId = req.user.id;

    return this.tasksService.createTask({
      nombre: body.nombre,
      descripcion: body.descripcion,
      storyPoints: body.storyPoints,
      fechaEntrega: body.fechaEntrega,
      assignedTo: body.assignedTo,
      createdBy: userId,
    });
  }

  // Listar tareas
  @ApiOperation({ summary: 'Listar todas las tareas, con filtros opcionales por usuario o estado' })
  @UseGuards(JwtAuthGuard)
  @Get()
  async list(
    @Query('assignedTo') assignedTo: string,
    @Query('estado') estado: string,
  ) {
    const filters: any = {};
    if (assignedTo) filters.assignedTo = parseInt(assignedTo, 10);
    if (estado) filters.estado = estado;

    return this.tasksService.listTasks(filters);
  }

  // Obtener detalles de tarea
  @ApiOperation({ summary: 'Obtener detalles de una tarea, incluyendo comentarios y categorías' })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async details(@Param('id') id: string) {
    return this.tasksService.getTaskDetails(parseInt(id, 10));
  }

  // Actualizar tarea
  @ApiOperation({ summary: 'Actualizar una tarea existente (excepto ID y creador)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nombre: { type: 'string', example: 'Actualizar nombre de la tarea' },
        descripcion: { type: 'string', example: 'Nueva descripción actualizada' },
        story_points: { type: 'number', example: 5 },
        estado: { type: 'string', example: 'EN_PROGRESO' },
        fecha_entrega: { type: 'string', example: '2026-03-01' },
        id_usuario_asignado: { type: 'number', example: 3 },
      },
      required: [], // todos opcionales salvo restricciones lógicas
    },
  })
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.tasksService.updateTask(parseInt(id, 10), body);
  }

  // Asociar categoría a tarea
  @ApiOperation({ summary: 'Asociar una categoría a una tarea existente' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        categoryId: { type: 'number', example: 1 },
      },
      required: ['categoryId'],
    },
  })
  @UseGuards(JwtAuthGuard)
  @Post(':id/categories')
  async addCategory(
    @Param('id') id: string,
    @Body('categoryId') categoryId: number,
  ) {
    return this.tasksService.addCategoryToTask(
      parseInt(id, 10),
      categoryId,
    );
  }

  // Listar categorías NO asociadas a una tarea
  @ApiOperation({ summary: 'Listar categorías que no están asociadas a una tarea' })
  @UseGuards(JwtAuthGuard)
  @Get(':id/categories/not-associated')
  async getCategoriesNotAssociated(@Param('id') id: string) {
    return this.tasksService.getCategoriesNotInTask(parseInt(id, 10));
  }
}