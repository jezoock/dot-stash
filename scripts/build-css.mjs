// Compiles the theme stylesheets with Sass (npm run build:css), as dot-stash.config.mjs sets them:
// each theme, scss/themes/<theme>/index.scss → dist/css/<theme>.css, and its page stylesheets,
// scss/themes/<theme>/pages/<page>.scss (but the _partials) → dist/css/pages/<theme>/<page>.css.
//
//   node scripts/build-css.mjs [--watch] [--strict] [--source-map]
//
//   --watch       after the build, recompiles what a change in scss/ concerns: a file of the engine, every theme and its pages;
//                 a file of a theme, that theme and its pages; a page stylesheet, that page. A Sass error is printed and the
//                 watch goes on, with the last stylesheet that compiled.
//   --strict      a Sass warning fails the compilation, as an error.
//   --source-map  writes <stylesheet>.css.map next to each stylesheet (or `css.sourceMap` in dot-stash.config.mjs).
//
// The build deletes dist/css/ first. Without --watch, it exits with code 1 if a stylesheet fails to compile.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import * as sass from 'sass';
import config from '../dot-stash.config.mjs';

const options = { 'watch': { type: 'boolean' }, 'strict': { type: 'boolean' }, 'source-map': { type: 'boolean' } };
let flags;
try {
  ({ values: flags } = parseArgs({ options }));
} catch (error) {
  console.error(`${error.message}\nUsage: node scripts/build-css.mjs [--watch] [--strict] [--source-map]`);
  process.exit(2);
}
const sourceMap = Boolean(flags['source-map'] || config.css.sourceMap);

const root = fileURLToPath(new URL('..', import.meta.url));
const scssDir = path.join(root, config.paths.scss);
const cssDir = path.join(root, config.paths.css);
const relative = file => path.relative(root, file);

/** A compilation: a Sass entry point and the stylesheet it writes. */
const themeJob = theme => ({ source: path.join(scssDir, 'themes', theme, 'index.scss'), destination: path.join(cssDir, `${theme}.css`) });
const pageJob = (theme, source) => ({ source, destination: path.join(cssDir, 'pages', theme, `${path.basename(source, '.scss')}.css`) });

/** A theme and its page stylesheets: the .scss files directly in its pages/ folder, but the partials. */
const themeJobs = theme => {
  const pagesDir = path.join(scssDir, 'themes', theme, 'pages');
  const pages = fs.existsSync(pagesDir) ? fs.readdirSync(pagesDir).filter(file => file.endsWith('.scss') && !file.startsWith('_')) : [];
  return [themeJob(theme), ...pages.sort().map(page => pageJob(theme, path.join(pagesDir, page)))];
};

/** Compiles an entry point. Throws on a Sass error, or on a warning with --strict. */
const compile = ({ source, destination }) => {
  let warnings = 0;
  const logger = {
    warn(message, { deprecation, span, stack }) {
      warnings += 1;
      const where =
        span?.url?.protocol === 'file:' ? `\n    ${relative(fileURLToPath(span.url))} ${span.start.line + 1}:${span.start.column + 1}` : stack ? `\n${stack.trimEnd()}` : '';
      console.warn(`${deprecation ? 'Deprecation warning' : 'Warning'}: ${message}${where}`);
    },
  };
  const result = sass.compile(source, { style: config.css.style, sourceMap, sourceMapIncludeSources: sourceMap, logger });
  if (flags.strict && warnings > 0) {
    throw new Error(`${relative(source)}: ${warnings} Sass warning(s), which --strict makes errors.`);
  }

  let { css } = result;
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  if (result.sourceMap) {
    const toRelativeUrl = url => (url.startsWith('file:') ? path.relative(path.dirname(destination), fileURLToPath(url)).split(path.sep).join('/') : url);
    const map = { ...result.sourceMap, file: path.basename(destination), sources: result.sourceMap.sources.map(toRelativeUrl) };
    fs.writeFileSync(`${destination}.map`, JSON.stringify(map));
    css += `\n/*# sourceMappingURL=${path.basename(destination)}.map */`;
  }
  fs.writeFileSync(destination, css);
  console.log(`${relative(source)} → ${relative(destination)}`);
};

/** Runs the compilations and prints their errors. Returns false when one failed. */
const run = jobs =>
  jobs
    .map(job => {
      try {
        if (fs.existsSync(job.source)) {
          compile(job);
        } else {
          // A deleted page stylesheet (watch): its stylesheet goes too.
          fs.rmSync(job.destination, { force: true });
          fs.rmSync(`${job.destination}.map`, { force: true });
          console.log(`${relative(job.source)} deleted → ${relative(job.destination)} deleted`);
        }
        return true;
      } catch (error) {
        console.error(`Error: ${error instanceof Error ? error.message : error}`);
        return false;
      }
    })
    .every(Boolean);

/** What a change of a file of scss/ recompiles. */
const jobsFor = file => {
  const [dir, theme, sub, page, ...rest] = path.relative(scssDir, file).split(path.sep);
  if (dir !== 'themes') {
    return config.themes.flatMap(themeJobs); // the engine: every theme
  }
  if (!config.themes.includes(theme)) {
    return []; // a theme that is not built
  }
  if (sub === 'pages' && page && !page.startsWith('_') && rest.length === 0) {
    return [pageJob(theme, file)];
  }
  return themeJobs(theme);
};

/** Recompiles on change, once the changes of an editor save or a git checkout stop for 100 ms. */
const watch = () => {
  const changed = new Set();
  let timer;
  fs.watch(scssDir, { recursive: true }, (_event, filename) => {
    if (!filename?.endsWith('.scss')) {
      return;
    }
    changed.add(path.join(scssDir, filename));
    clearTimeout(timer);
    timer = setTimeout(() => {
      const jobs = new Map([...changed].flatMap(jobsFor).map(job => [job.destination, job]));
      console.log(`\n[${new Date().toLocaleTimeString()}] Changed: ${[...changed].map(relative).join(', ')}`);
      changed.clear();
      run([...jobs.values()]);
    }, 100);
  });
  console.log(`Watching ${relative(scssDir)}/ for changes…`);
};

fs.rmSync(cssDir, { recursive: true, force: true });
fs.mkdirSync(cssDir, { recursive: true }); // even if nothing compiles: the Stencil watch of npm start reads it
const built = run(config.themes.flatMap(themeJobs));

if (flags.watch) {
  watch();
  // Started by scripts/dev.mjs (npm start), with an IPC channel: tell it the stylesheets are there, and stop with it.
  if (process.send) {
    process.send('ready');
    process.on('disconnect', () => process.exit());
  }
} else if (!built) {
  process.exitCode = 1;
}
