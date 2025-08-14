/**
 * Vitest setup file
 * Global test setup and configurations
 */

import { vi } from 'vitest';

// Mock environment variables
vi.mock('astro:env', () => ({
  getSecret: vi.fn(),
}));

// Mock Astro runtime
vi.mock('astro:content', () => ({
  getCollection: vi.fn(),
  getEntry: vi.fn(),
}));

// Global test utilities
global.console.warn = vi.fn();
global.console.error = vi.fn();
