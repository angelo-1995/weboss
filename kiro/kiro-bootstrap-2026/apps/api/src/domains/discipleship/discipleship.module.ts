import { Module } from '@nestjs/common';
import { DiscipleshipController } from './discipleship.controller';
import { DiscipleshipService } from './discipleship.service';
import { DiscipleshipRepository } from './discipleship.repository';

@Module({
  controllers: [DiscipleshipController],
  providers: [DiscipleshipService, DiscipleshipRepository],
  exports: [DiscipleshipService],
})
export class DiscipleshipModule {}
