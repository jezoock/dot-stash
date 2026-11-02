import fs from 'fs';
import gulp from 'gulp';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import concat from 'gulp-concat';
import BrowserSync from 'browser-sync';
import DotstashConfig from './dot-stash.config.mjs';
import imagemin from 'gulp-imagemin';
import webp from 'gulp-webp';

const browserSync = BrowserSync.create();
const sass = gulpSass(dartSass);
const { themes, paths, gulp: settings } = DotstashConfig;

const scssDir = `${paths.source.root}/${paths.source.css}`;
const engineDir = `${scssDir}/${paths.source.engine}`;
const themeDir = theme => `${scssDir}/${paths.source.themes}/${theme}`;
const themePagesDir = theme => `${themeDir(theme)}/${paths.source.pages}`;
const cssDestination = `${paths.destination.root}/${paths.destination.css}`;
const pagesDestination = theme => `${cssDestination}/${paths.destination.pages}/${theme}`;

/** Names a task function, for the gulp logs. */
const task = (name, fn) => Object.assign(fn, { displayName: name });

/**
 * Compiles SCSS entry points to compressed CSS. In a one-off build a Sass error fails the task;
 * while watching (`logErrors`), it is only logged, and the watch goes on.
 */
const compile = (stream, { logErrors = false } = {}) => {
  const compiler = sass({ style: 'compressed' });
  let css = stream.pipe(logErrors ? compiler.on('error', sass.logError) : compiler);

  if (settings.scss.autoprefix) {
    css = css.pipe(autoprefixer({ browsers: settings.scss.autoprefixerTargetBrowsers }));
  }

  return css;
};

/** scss/themes/<theme>/index.scss → dist/css/<theme>.css */
const buildTheme = (theme, options) =>
  compile(gulp.src(`${themeDir(theme)}/index.scss`), options)
    .pipe(concat(`${theme}.css`))
    .pipe(gulp.dest(cssDestination))
    .pipe(browserSync.stream());

/** scss/themes/<theme>/pages/<page>.scss (all of them, or `files`) → dist/css/pages/<theme>/<page>.css */
const buildPages = (theme, options, files = `${themePagesDir(theme)}/*.scss`) =>
  compile(gulp.src(files, { base: themePagesDir(theme) }), options)
    .pipe(gulp.dest(pagesDestination(theme)))
    .pipe(browserSync.stream());

const themeTask = (theme, options) => task(`theme:${theme}`, () => buildTheme(theme, options));
const pagesTask = (theme, options) => task(`pages:${theme}`, () => buildPages(theme, options));

const cleanCSS = task('clean:css', done => {
  if (settings.scss.cleanDestinationDirectory) {
    fs.rmSync(cssDestination, { recursive: true, force: true });
  }
  done();
});

/** Every theme and its page stylesheets (npm run build:css). */
export const buildCSS = gulp.series(cleanCSS, gulp.parallel(...themes.flatMap(theme => [themeTask(theme), pagesTask(theme)])));

export const generateImages = () => {
  return gulp
    .src('./images/*')
    .pipe(imagemin())
    .pipe(gulp.dest(`${paths.destination.root}/${paths.destination.images}`))
    .pipe(webp({ quality: 80 }))
    .pipe(gulp.dest(`${paths.destination.root}/${paths.destination.images}`));
};

const server = () => {
  browserSync.init({
    ...settings.server,
    files: settings.server.files.map(file => `${paths.source.root}/${file}`),
  });

  const watching = { logErrors: true };

  // The engine is shared: a change rebuilds every theme and its pages.
  gulp.watch(`${engineDir}/**/*.scss`, gulp.parallel(...themes.flatMap(theme => [themeTask(theme, watching), pagesTask(theme, watching)])));

  themes.forEach(theme => {
    // A theme file (tokens, base, skins): that theme and its pages, which use its tokens.
    gulp.watch([`${themeDir(theme)}/**/*.scss`, `!${themePagesDir(theme)}/**`], gulp.parallel(themeTask(theme, watching), pagesTask(theme, watching)));

    // A page stylesheet: that page only.
    const pagesWatcher = gulp.watch(`${themePagesDir(theme)}/*.scss`);
    pagesWatcher.on('add', file => buildPages(theme, watching, file));
    pagesWatcher.on('change', file => buildPages(theme, watching, file));
  });
};

export default server;
