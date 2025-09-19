import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    isolate: true,
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
    sequence: { concurrent: false },
  },
});
