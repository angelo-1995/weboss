import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../../domains/auth/guards/jwt-auth.guard';
import { z } from 'zod';

const SearchQuerySchema = z.object({
  q: z.string().min(2).max(100),
  type: z.enum(['users', 'groups', 'discipleship', 'all']).optional().default('all'),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Throttle({ medium: { limit: 30, ttl: 60000 } })
  async search(@Query() query: Record<string, string>) {
    const { q, type, limit } = SearchQuerySchema.parse(query);

    if (type === 'users') return this.searchService.searchUsers(q, limit);
    if (type === 'groups') return this.searchService.searchGroups(q, limit);
    if (type === 'discipleship') return this.searchService.searchDiscipleship(q, limit);

    // type === 'all' — combined search
    return this.searchService.globalSearch(q, limit);
  }
}
