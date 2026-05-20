import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { z } from 'zod';

const AuditQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  resource: z.string().optional(),
  action: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findMany(@Query() query: Record<string, string>) {
    const parsed = AuditQuerySchema.parse(query);
    return this.auditService.findMany(parsed);
  }
}
