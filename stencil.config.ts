import { Config } from '@stencil/core/internal';
import { sass } from '@stencil/sass';

export const config: Config = {
  namespace: 'maloo-dot-stash',
  srcDir: './components',
  minifyJs: true,
  extras: {
    appendChildSlotFix: true,
    cloneNodeFix: true,
  },
  /* bundles: [
    {
      components: [
        'ds-page', 
        'ds-heading', 
        'ds-app-menu', 
        'ds-nav', 
        'ds-nav-item', 
        'ds-product-block', 
        'ds-account-block',
        'ds-cart-block',
        'ds-grid',
        'ds-grid-item',
        'ds-marquee',
        'ds-trigger',
        'ds-title',
        'ds-text',
        'ds-block',
        'ds-rsp',
        'ds-back-to-top-button',
        'ds-slider',
        'ds-slider-item',
      ]
    },
  ], */
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
      'type': 'www'
    },
    {
      type: 'dist',
      dir: '../assets/components'
      /* 
      copy: [
        { src: '../dist', dest: '../../../assets' }
      ] */
    }
  ],
};
