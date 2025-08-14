import { describe, expect, it } from 'vitest';
import { formatDate } from '../format-date';

describe('formatDate', () => {
  it('formats ISO date string correctly', () => {
    const result = formatDate('2024-01-15');
    expect(result).toBe('Jan 15, 2024');
  });

  it('formats full ISO datetime string correctly', () => {
    const result = formatDate('2024-01-15T10:30:00Z');
    expect(result).toBe('Jan 15, 2024');
  });

  it('handles different months', () => {
    expect(formatDate('2024-03-01')).toBe('Mar 01, 2024');
    expect(formatDate('2024-12-25')).toBe('Dec 25, 2024');
  });

  it('handles different years', () => {
    expect(formatDate('2023-06-15')).toBe('Jun 15, 2023');
    expect(formatDate('2025-06-15')).toBe('Jun 15, 2025');
  });

  it('handles edge cases', () => {
    expect(formatDate('2024-02-29')).toBe('Feb 29, 2024'); // Leap year
    expect(formatDate('2024-01-01')).toBe('Jan 01, 2024'); // New year
    expect(formatDate('2024-12-31')).toBe('Dec 31, 2024'); // End of year
  });
});
