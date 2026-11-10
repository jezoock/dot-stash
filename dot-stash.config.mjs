// The stylesheet build: scripts/build-css.mjs (npm run build:css, and the CSS watcher of npm start) reads this file.
const DotstashConfig = {
  // The themes to compile, folders of scss/themes/: scss/themes/<theme>/index.scss → dist/css/<theme>.css, and its page
  // stylesheets, scss/themes/<theme>/pages/<page>.scss (but the _partials) → dist/css/pages/<theme>/<page>.css.
  // A theme added to scss/themes/ is listed here too (see "Creating a theme" in README.md).
  themes: ['default'],
  paths: {
    // The SCSS sources, from the root of the repository: engine/ and themes/<theme>/. The watcher watches this folder.
    scss: 'scss',
    // The compiled stylesheets, deleted before each full build. The Stencil build copies this folder to www/css/
    // (stencil.config.ts).
    css: 'dist/css',
  },
  css: {
    // The Sass output style: 'compressed' or 'expanded'.
    style: 'compressed',
    // Writes a source map, <stylesheet>.css.map, next to each stylesheet (or: npm run build:css -- --source-map).
    sourceMap: false,
  },
};

export default DotstashConfig;
