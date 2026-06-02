import { Global, Module } from '@nestjs/common';
import { HierarchyVisibilityService } from './hierarchy-visibility.service';
import { OwnershipService } from './ownership.service';

@Global()
@Module({
  providers: [HierarchyVisibilityService, OwnershipService],
  exports: [HierarchyVisibilityService, OwnershipService],
})
export class HierarchyVisibilityModule {}
