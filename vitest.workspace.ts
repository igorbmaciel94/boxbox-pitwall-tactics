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
        '@apex/content': resolve(__dirname, 'packages/content/src/index.ts'),
      },
    },
    test: {
      name: 'engine',
      root: 'packages/engine',
      include: ['__tests__/**/*.test.ts'],
    },
  },
  {
    resolve: {
      alias: {
        '@apex/engine': resolve(__dirname, 'packages/engine/src/index.ts'),
        '@apex/content': resolve(__dirname, 'packages/content/src/index.ts'),
        '@content-data': resolve(__dirname, 'packages/content/data'),
      },
    },
    test: {
      name: 'web',
      root: 'apps/web',
      include: ['__tests__/**/*.test.ts'],
    },
  },
]);
