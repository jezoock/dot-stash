const DotstashConfig = {
  // The themes gulp compiles: scss/themes/<theme>/index.scss → dist/css/<theme>.css,
  // and their page stylesheets scss/themes/<theme>/pages/<page>.scss → dist/css/pages/<theme>/<page>.css.
  // The first one is the default theme of the demo pages.
  themes: ['legacy'],
  paths: {
    source: {
      root: '.',
      css: 'scss',
      engine: 'engine',
      themes: 'themes',
      pages: 'pages',
      images: 'images',
    },
    destination: {
      root: 'dist',
      css: 'css',
      pages: 'pages',
      images: 'images',
    },
  },
  gulp: {
    server: {
      server: { baseDir: '.' },
      watchOptions: { ignored: ['**/node_modules/**'] },
      files: ['**/*.html', '**/*.htm', 'www/build/*.*'],
    },
    scss: {
      autoprefix: false,
      autoprefixerTargetBrowsers: ['last 2 versions'],
      // Delete dist/css before a full build.
      cleanDestinationDirectory: true,
    },
  },
};

export default DotstashConfig;
