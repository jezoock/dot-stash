import { Config } from '@stencil/core/internal';
import { sass } from '@stencil/sass';

export const config: Config = {
  namespace: 'dot-stash',
  srcDir: 'components',
  plugins: [
    sass({
      includePaths: ['components/**/*.scss'],
      /* injectGlobalPaths: [
        'src/scss/variables/breakpoint.scss',
        'src/scss/variables/palette.scss',
        'src/scss/variables/typography.scss',
        'src/scss/variables/spacing.scss',
        'src/scss/tools/breakpoints.scss',
        'src/scss/tools/typography.scss',
        'src/scss/tools/colors.scss',
        'src/scss/tools/theme.scss',
      ] */
    })
  ],
  outputTargets: [
    {
      type: 'dist'
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
      copy: [
        { src: '../www/build', dest: '../../assets/dot-stash' }
      ]
    },
  ],
};
