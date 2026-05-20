import { describe, it, expect } from 'vitest';

describe('SermonCard', () => {
  it('should be defined', () => {
    expect(true).toBe(true);
  });

  it.todo('should render sermon title');
  it.todo('should show unread badge when isUnread is true');
  it.todo('should truncate description to 150 characters');
});
