/**
 * Cursor-based pagination utilities.
 * Uses the entity `id` field as the cursor key.
 */

/**
 * Parameters for cursor-based pagination.
 */
export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
}

/**
 * Response shape for cursor-paginated endpoints.
 */
export interface CursorPaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
}

/**
 * Default and max limits for pagination.
 */
export const PAGINATION_DEFAULTS = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/**
 * Validates and normalizes pagination params.
 */
export function normalizePaginationParams(params: CursorPaginationParams): {
  cursor?: string;
  limit: number;
} {
  const limit = Math.min(
    Math.max(params.limit || PAGINATION_DEFAULTS.DEFAULT_LIMIT, 1),
    PAGINATION_DEFAULTS.MAX_LIMIT,
  );
  return { cursor: params.cursor, limit };
}

/**
 * Builds a Prisma-compatible cursor query from pagination params.
 * Uses the `id` field as the cursor key.
 */
export function buildCursorQuery(params: CursorPaginationParams) {
  const { cursor, limit } = normalizePaginationParams(params);

  const query: Record<string, unknown> = {
    take: limit + 1, // Fetch one extra to determine hasMore
    orderBy: { id: 'asc' as const },
  };

  if (cursor) {
    query.skip = 1; // Skip the cursor item itself
    query.cursor = { id: cursor };
  }

  return { query, limit };
}

/**
 * Processes raw results from a cursor query into a paginated response.
 */
export function buildCursorResponse<T extends { id: string }>(
  items: T[],
  limit: number,
): CursorPaginatedResponse<T> {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;

  return {
    data,
    nextCursor,
    hasMore,
  };
}
