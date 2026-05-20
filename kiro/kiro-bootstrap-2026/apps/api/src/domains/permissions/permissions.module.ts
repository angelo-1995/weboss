import { Module, Global } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsRepository } from './permissions.repository';
import { PermissionsController } from './permissions.controller';
import { PermissionsGuard } from './guards/permissions.guard';

@Global()
@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionsRepository, PermissionsGuard],
  exports: [PermissionsService, PermissionsGuard],
})
export class PermissionsModule {}
