import { Module } from '@nestjs/common';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { GroupsRepository } from './groups.repository';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';

@Module({
  controllers: [GroupsController, MembersController],
  providers: [GroupsService, GroupsRepository, MembersService],
  exports: [GroupsService, MembersService],
})
export class GroupsModule {}
