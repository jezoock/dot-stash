import { join } from 'path';
import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  namespace: 'dot-stash',
  srcDir: './components',
  // tsconfig.json without the tests (tsconfig.build.json): the build compiles every TypeScript file of the program it gets,
  // and would publish the test helpers (test/) that the test files import. tsconfig.json, which covers the tests too, is
  // the one of the editors and of `npm run typecheck`.
  tsconfig: 'tsconfig.build.json',
  minifyJs: true,
  extras: {
    appendChildSlotFix: true,
    cloneNodeFix: true,
  },
  plugins: [sass()],
  // npm start (scripts/dev.mjs): the theme stylesheets that the CSS watcher recompiles make a rebuild, which copies them
  // to www/css/ (below), and the dev server reloads the page (Stencil's hot replacement does not see copied stylesheets).
  watchExternalDirs: [join(__dirname, 'dist', 'css')],
  devServer: {
    excludeHmr: ['**/dist/css/**'],
  },
  // While the unit tests move to Vitest (vitest.config.mts), Stencil's test runner skips the spec files already moved.
  testing: {
    testPathIgnorePatterns: [
      '/node_modules/',
      '/.stencil/',
      '/dist/',
      '/www/',
      '/components/utils/',
      '/components/sass\\.spec\\.ts$',
      '/components/core/mods\\.spec\\.tsx$',
      '/components/core/(ajax|block|grid|heading|icon|select|title|toaster|tooltip|trigger)/',
      '/components/core/(combo|toggle|toggle-group)/',
    ],
  },
  outputTargets: [
    {
      type: 'www',
      // No generated service worker: Workbox would load its runtime from a third-party CDN.
      serviceWorker: null,
      // The stylesheets compiled by scripts/build-css.mjs (npm run build:css, run first): dist/css/ → www/css/
      // (<theme>.css, pages/<theme>/<page>.css), for the dev page of www/ (components/index.html), served by npm start.
      copy: [{ src: '../dist/css', dest: 'css' }],
    },
    {
      type: 'dist',
      dir: 'dist',
      // Matches the "loader/" entry of package.json "files".
      esmLoaderPath: '../loader',
      // scripts/build-css.mjs writes dist/css: do not let Stencil empty dist/ before each build.
      empty: false,
    },
  ],
};
