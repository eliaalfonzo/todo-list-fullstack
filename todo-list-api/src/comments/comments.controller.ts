import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Comments') // Agrupa los endpoints en Swagger bajo "Comments"
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({ summary: 'Crear un comentario para una tarea' })
  @ApiBearerAuth('JWT-auth') // Indica que requiere token para Swagger
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        taskId: { type: 'number', example: 1 },
        contenido: { type: 'string', example: 'Este es un comentario' },
      },
      required: ['taskId', 'contenido'],
    },
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: any, @Req() req: any) {
    const userId = req.user.id;

    return this.commentsService.createComment({
      taskId: body.taskId,
      contenido: body.contenido,
      userId,
    });
  }
}