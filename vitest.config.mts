import { defineVitestConfig } from '@stencil/vitest/config';
import { stencilVitestPlugin } from '@stencil/vitest/plugin';

export default defineVitestConfig({
  stencilConfig: './stencil.config.ts',
  test: {
    // The tests import describe, it, expect… from vitest.
    globals: false,
    projects: [
      {
        // Unit tests: the components and the utilities in Stencil's simulated DOM (mock-doc), without a browser. The
        // plugin compiles the components from their sources, as the test files import them (no build needed).
        plugins: [stencilVitestPlugin()],
        test: {
          name: 'unit',
          // The spec files moved from Stencil's test runner so far (stencil.config.ts, testing).
          include: ['components/utils/**/*.spec.ts'],
          environment: 'stencil',
          setupFiles: ['./test/setup/unit.ts'],
          // Before each test: the spies (vi.spyOn) get their original back, and the globals of vi.stubGlobal() too.
          restoreMocks: true,
          unstubGlobals: true,
        },
      },
      {
        // The stylesheets, compiled with the Sass JavaScript API, in Node.
        test: {
          name: 'styles',
          include: ['components/sass.spec.ts'],
          environment: 'node',
        },
      },
    ],
  },
});
