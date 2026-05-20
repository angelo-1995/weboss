import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  Res,
  UseGuards,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FastifyRequest, FastifyReply } from 'fastify';
import { join } from 'path';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { SermonsService } from './sermons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NetworkPastorGuard } from './guards/network-pastor.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { CreateSermonSchema } from './dto/create-sermon.dto';
import { UpdateSermonSchema } from './dto/update-sermon.dto';
import { SermonQuerySchema } from './dto/sermon-query.dto';
import {
  MAX_ATTACHMENTS,
} from '../../common/utils/file-upload.util';
import type { MultipartFile } from '@fastify/multipart';

@ApiTags('sermons')
@ApiBearerAuth()
@Controller('sermons')
@UseGuards(JwtAuthGuard)
export class SermonsController {
  constructor(private readonly service: SermonsService) {}

  @Post()
  @UseGuards(NetworkPastorGuard)
  @ApiOperation({ summary: 'Create a new sermon' })
  @ApiResponse({ status: 201, description: 'Sermon created successfully' })
  @ApiResponse({ status: 403, description: 'Only network pastors can create sermons' })
  create(@Body() body: unknown, @CurrentUser() user: CurrentUserData) {
    const dto = CreateSermonSchema.parse(body);
    return this.service.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List sermons for the authenticated user\'s network' })
  @ApiResponse({ status: 200, description: 'Paginated list of sermons' })
  findAll(@Query() query: unknown, @CurrentUser() user: CurrentUserData) {
    const dto = SermonQuerySchema.parse(query);
    return this.service.findByNetwork(user.id, dto);
  }

  @Get('admin/stats')
  @UseGuards(NetworkPastorGuard)
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Admin stats returned' })
  @ApiResponse({ status: 403, description: 'Only network pastors can view stats' })
  getAdminStats(@CurrentUser() user: CurrentUserData) {
    return this.service.getAdminStats(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sermon detail by ID' })
  @ApiResponse({ status: 200, description: 'Sermon detail returned' })
  @ApiResponse({ status: 404, description: 'Sermon not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.service.findById(id, user.id);
  }

  @Patch(':id')
  @UseGuards(NetworkPastorGuard)
  @ApiOperation({ summary: 'Update an existing sermon' })
  @ApiResponse({ status: 200, description: 'Sermon updated successfully' })
  @ApiResponse({ status: 404, description: 'Sermon not found' })
  @ApiResponse({ status: 403, description: 'Only the creator or admin can update' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: unknown,
    @CurrentUser() user: CurrentUserData,
  ) {
    const dto = UpdateSermonSchema.parse(body);
    return this.service.update(id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(NetworkPastorGuard)
  @ApiOperation({ summary: 'Soft-delete a sermon' })
  @ApiResponse({ status: 200, description: 'Sermon deleted successfully' })
  @ApiResponse({ status: 404, description: 'Sermon not found' })
  @ApiResponse({ status: 403, description: 'Only the creator or admin can delete' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.service.softDelete(id, user.id);
  }

  @Get(':id/views')
  @UseGuards(NetworkPastorGuard)
  @ApiOperation({ summary: 'Get view analytics for a sermon' })
  @ApiResponse({ status: 200, description: 'View analytics returned' })
  @ApiResponse({ status: 404, description: 'Sermon not found' })
  @ApiResponse({ status: 403, description: 'Only network pastors can view analytics' })
  getViews(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getViewAnalytics(id);
  }

  // --- File Upload Endpoints ---

  @Post(':id/cover-image')
  @UseGuards(NetworkPastorGuard)
  @ApiOperation({ summary: 'Upload cover image for a sermon' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Cover image uploaded' })
  @ApiResponse({ status: 400, description: 'Invalid file format or size' })
  @ApiResponse({ status: 403, description: 'Only the creator or admin can upload' })
  async uploadCoverImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: FastifyRequest,
    @CurrentUser() user: CurrentUserData,
  ) {
    const file = await req.file();
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }
    return this.service.uploadCoverImage(id, file as MultipartFile, user.id);
  }

  @Post(':id/files')
  @UseGuards(NetworkPastorGuard)
  @ApiOperation({ summary: 'Upload file attachments for a sermon' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Files uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file format, size, or count exceeded' })
  @ApiResponse({ status: 403, description: 'Only the creator or admin can upload' })
  async uploadFiles(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: FastifyRequest,
    @CurrentUser() user: CurrentUserData,
  ) {
    const parts = req.files();
    const files: MultipartFile[] = [];

    for await (const part of parts) {
      files.push(part as MultipartFile);
    }

    if (files.length === 0) {
      throw new BadRequestException('No se proporcionaron archivos');
    }

    if (files.length > MAX_ATTACHMENTS) {
      throw new BadRequestException(
        `Se permite un máximo de ${MAX_ATTACHMENTS} archivos adjuntos por predicación`,
      );
    }

    return this.service.uploadFiles(id, files, user.id);
  }

  @Delete(':id/files/:fileId')
  @UseGuards(NetworkPastorGuard)
  @ApiOperation({ summary: 'Delete a file attachment from a sermon' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File or sermon not found' })
  @ApiResponse({ status: 403, description: 'Only the creator or admin can delete' })
  async deleteFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('fileId', ParseUUIDPipe) fileId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    await this.service.deleteFile(id, fileId, user.id);
    return { message: 'Archivo eliminado exitosamente' };
  }

  // --- Static File Serving ---

  @Get('uploads/:sermonId/:filename')
  @ApiOperation({ summary: 'Serve uploaded sermon files (auth required)' })
  @ApiResponse({ status: 200, description: 'File served' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async serveFile(
    @Param('sermonId', ParseUUIDPipe) sermonId: string,
    @Param('filename') filename: string,
    @Res() reply: FastifyReply,
    @CurrentUser() user: CurrentUserData,
  ) {
    // Validate access
    await this.service.validateFileAccess(sermonId, user.id);

    // Sanitize filename to prevent path traversal
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    if (!sanitizedFilename || sanitizedFilename.includes('..')) {
      throw new BadRequestException('Invalid filename');
    }

    const filePath = join(process.cwd(), 'uploads', 'sermons', sermonId, sanitizedFilename);

    try {
      const fileStat = await stat(filePath);
      if (!fileStat.isFile()) {
        throw new Error('Not a file');
      }
    } catch {
      throw new BadRequestException('File not found');
    }

    const stream = createReadStream(filePath);
    const mimeType = getMimeType(sanitizedFilename);

    return reply
      .header('Content-Type', mimeType)
      .header('Content-Disposition', `inline; filename="${sanitizedFilename}"`)
      .send(stream);
  }
}


function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
  };
  return mimeMap[ext ?? ''] ?? 'application/octet-stream';
}
