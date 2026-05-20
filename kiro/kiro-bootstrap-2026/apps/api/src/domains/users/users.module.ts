import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { OrganigramaService } from './organigrama.service';
import { CoberturaService } from './cobertura.service';
import { SpiritualStageService } from './spiritual-stage.service';
import { SpiritualStageController } from './spiritual-stage.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [UsersController, SpiritualStageController],
  providers: [UsersService, UsersRepository, OrganigramaService, CoberturaService, SpiritualStageService],
  exports: [UsersService, SpiritualStageService],
})
export class UsersModule {}
