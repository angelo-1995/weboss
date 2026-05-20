import { Module } from '@nestjs/common';
import { NetworksController } from './networks.controller';
import { NetworksService } from './networks.service';
import { NetworksRepository } from './networks.repository';

@Module({
  controllers: [NetworksController],
  providers: [NetworksService, NetworksRepository],
  exports: [NetworksService],
})
export class NetworksModule {}
