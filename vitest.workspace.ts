import { defineWorkspace } from 'vitest/config';
import { resolve } from 'path';

export default defineWorkspace([
  {
    test: {
      name: 'content',
      root: 'packages/content',
      include: ['__tests__/**/*.test.ts'],
    },
  },
  {
    resolve: {
      alias: {
        '@boxbox/content': resolve(__dirname, 'packages/content/src/index.ts'),
      },
    },
    test: {
      name: 'engine',
      root: 'packages/engine',
      include: ['__tests__/**/*.test.ts'],
    },
  },
]);
