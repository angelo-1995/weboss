import { Module } from '@nestjs/common';
import { PersonsController } from './persons.controller';
import { PipelineStagesController } from './pipeline-stages.controller';
import { PersonsService } from './persons.service';
import { PersonsRepository } from './persons.repository';

@Module({
  controllers: [PersonsController, PipelineStagesController],
  providers: [PersonsService, PersonsRepository],
  exports: [PersonsService],
})
export class PersonsModule {}
