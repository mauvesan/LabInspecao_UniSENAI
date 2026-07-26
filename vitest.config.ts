import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',

    include: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'tests/**/*.test.ts', 'tests/**/*.spec.ts'],

    exclude: ['dist/**', 'node_modules/**', 'tests/smoke.mjs'],

    coverage: {
      reporter: ['text', 'html'],
    },

    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
  },
});
