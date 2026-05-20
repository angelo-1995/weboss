import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { NetworksService } from './networks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('networks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NetworksController {
  constructor(private readonly service: NetworksService) {}

  @Get()
  findAll(): Promise<any> {
    return this.service.findAllTree();
  }

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  create(@Body() body: { code: string; name: string; parentNetworkId?: string }): Promise<any> {
    return this.service.create(body);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { name?: string; code?: string; parentNetworkId?: string | null },
  ): Promise<any> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    return this.service.remove(id);
  }

  @Post(':id/leaders')
  @Roles('ADMIN', 'SUPER_ADMIN')
  assignLeader(
    @Param('id', ParseUUIDPipe) networkId: string,
    @Body() body: { userId: string; role?: string },
  ): Promise<any> {
    return this.service.assignLeader(networkId, body.userId, body.role);
  }

  @Delete(':id/leaders/:userId')
  @Roles('ADMIN', 'SUPER_ADMIN')
  removeLeader(
    @Param('id', ParseUUIDPipe) networkId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<any> {
    return this.service.removeLeader(networkId, userId);
  }

  @Get(':id/leaders')
  @Roles('ADMIN', 'SUPER_ADMIN')
  getLeaders(@Param('id', ParseUUIDPipe) networkId: string): Promise<any> {
    return this.service.getNetworkLeaders(networkId);
  }
}
