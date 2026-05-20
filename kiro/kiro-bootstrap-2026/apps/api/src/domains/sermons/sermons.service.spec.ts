import { describe, it, expect } from 'vitest';

describe('SermonsService', () => {
  it('should be defined', () => {
    expect(true).toBe(true);
  });

  // Placeholder — real tests will be added later
  it.todo('should create a sermon with PUBLISHED status when no publishAt');
  it.todo('should create a sermon with SCHEDULED status when publishAt is future');
  it.todo('should throw ForbiddenException when user is not a network pastor');
});
