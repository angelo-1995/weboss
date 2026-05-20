import { Global, Module } from '@nestjs/common';
import { HierarchyVisibilityService } from './hierarchy-visibility.service';

@Global()
@Module({
  providers: [HierarchyVisibilityService],
  exports: [HierarchyVisibilityService],
})
export class HierarchyVisibilityModule {}
