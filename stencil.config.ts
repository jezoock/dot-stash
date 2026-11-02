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
  plugins: [sass()],
  outputTargets: [
    {
      type: 'www',
      // No generated service worker: Workbox would load its runtime from a third-party CDN.
      serviceWorker: null,
      // The theme stylesheets compiled by gulp (npm run build:css, run first): dist/css/<theme>.css → www/css/<theme>.css,
      // for the dev page of www/ (components/index.html), served by npm start.
      copy: [{ src: '../dist/css/*.css', dest: 'css' }],
    },
    {
      type: 'dist',
      dir: 'dist',
      // Matches the "loader/" entry of package.json "files".
      esmLoaderPath: '../loader',
      // The gulp theme tasks write dist/css and dist/images:
      // do not let Stencil empty dist/ before each build.
      empty: false,
    },
  ],
};
