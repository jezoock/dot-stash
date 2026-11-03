// Stylelint (npm run lint:css) for the SCSS of scss/ and components/: the standard SCSS configuration, adapted to the
// conventions of the project. Prettier formats the files; Stylelint 16 and later have no formatting rule left to fight it.
// The theme stylesheets compile to the same CSS as before these rules: the options below keep what a fix would change in
// the output (dist/css/), which the projects and tokens.getToken() read. The `@prop` annotations of the component
// stylesheets are /** */ comments, which Stencil reads for the readmes: no rule checks their content.

const kebab = '[a-z][a-z0-9]*(?:-[a-z0-9]+)*';

/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard-scss'],
  rules: {
    // Naming. Classes: the BEM-like names of the components, `ds-<block>`, `ds-<block>__<element>`, with a `--<modifier>`
    // suffix (`ds-js--modal-open`) or as a class of their own (`--open`, `--h-pos-left`), checked once the nesting
    // (`&__element`, `&.--modifier`) is resolved. Custom properties: `--ds-<name>` (tokens and component properties).
    'selector-class-pattern': [
      `^(?:${kebab}(?:__${kebab})?)?(?:--${kebab})?$`,
      { resolveNestedSelectors: true, message: selector => `Expected class "${selector}" to be ds-<block>[__<element>][--<modifier>] or --<modifier>, in kebab-case` },
    ],
    'custom-property-pattern': [`^ds-${kebab}$`, { message: name => `Expected custom property "${name}" to be --ds-<name>, in kebab-case` }],

    // Blank lines group the lines of a block in this code base: the @use rules by kind, a @include among the declarations
    // it completes (`@include ds-icon(…)` after `position`), a // comment with the line below it, the $variables of a step
    // scale apart from the map built from them. Only the blank line before a top-level rule or at-rule is checked.
    'rule-empty-line-before': ['always-multi-line', { except: ['first-nested'], ignore: ['after-comment', 'inside-block'] }],
    'at-rule-empty-line-before': ['always', { except: ['first-nested'], ignore: ['after-comment', 'blockless-after-blockless', 'inside-block'], ignoreAtRules: ['else'] }],
    'declaration-empty-line-before': null,
    'custom-property-empty-line-before': null,
    'scss/double-slash-comment-empty-line-before': null,
    'scss/dollar-variable-empty-line-before': null,

    // Comments: an empty `//` line separates the paragraphs of a // comment (the usage examples of a mixin).
    'scss/comment-no-empty': null,

    // Sass: the engine compares with null on purpose (`@if $value == null`): `@if not $value` is also true for false.
    'scss/at-if-no-null': null,
    // A mixin call without arguments keeps its parentheses, `@include ds-tokens();`, as in the documentation.
    'scss/at-mixin-argumentless-call-parentheses': 'always',

    // Values written as is in the compiled theme, where a fix would change them:
    // - the six-digit colors of the palette, which the tokens write as they are (`--ds-color-gray-white: #ffffff`);
    'color-hex-length': 'long',
    // - the font names of the font stacks keep their case (`Roboto`, `SFMono-Regular`), and SVG keywords their camel case
    //   (`currentColor`, `optimizeLegibility`);
    'value-keyword-case': ['lower', { camelCaseSvgKeywords: true, ignoreProperties: ['/^\\$font-family-/'] }],
    // - the icon font name is quoted (`font-family: 'ds-icons'`), and has no generic family to fall back to: a glyph of
    //   the icon font means nothing in another font;
    'font-family-name-quotes': 'always-unless-keyword',
    'font-family-no-missing-generic-family-keyword': [true, { ignoreFontFamilies: ['ds-icons'] }],
    // - the themes write both :not() forms, chained simple ones (`:not([disabled]):not([checked])`) and a selector list
    //   (`input:not([type='checkbox'], [type='radio'])`): either rule would rewrite some of them.
    'selector-not-notation': null,

    // Safari still needs -webkit-user-select (user-select: none of the combo options).
    'property-no-vendor-prefix': [true, { ignoreProperties: ['-webkit-user-select'] }],
  },
};
