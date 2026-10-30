import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  namespace: 'dot-stash',
  srcDir: './components',
  minifyJs: true,
  extras: {
    appendChildSlotFix: true,
    cloneNodeFix: true,
  },
  plugins: [
    sass()
  ],
  outputTargets: [
    {
      type: 'www',
      // No generated service worker: Workbox would load its runtime from a third-party CDN.
      serviceWorker: null
    },
    {
      type: 'dist',
      dir: 'dist',
      // Matches the "loader/" entry of package.json "files".
      esmLoaderPath: '../loader',
      // The gulp theme tasks write dist/css, dist/js and dist/images:
      // do not let Stencil empty dist/ before each build.
      empty: false
    }
  ],
};
