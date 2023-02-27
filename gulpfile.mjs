import gulp from "gulp";
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import clean from "gulp-clean";
import autoprefixer from "gulp-autoprefixer";
import merge from "merge-stream";
import concat from "gulp-concat";
import BrowserSync from "browser-sync";
import DotstashConfig from "./dot-stash.config.mjs";

const browserSync = BrowserSync.create();
const sass = gulpSass(dartSass);
const { paths, gulp: settings } = DotstashConfig;

// gulpfile.js - css task
export const generateCSS = () => {
  let previouslyGeneratedFiles = gulp.src(`${paths.destination.css}/**/*.css` , { read: false });

  if(settings.scss.cleanDestinationDirectory) {
    previouslyGeneratedFiles = previouslyGeneratedFiles.pipe(clean({ force: true }));
  }

  let newlyGeneratedFiles = gulp
    .src(settings.scss.sourceFiles)
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError));

  if (settings.scss.autoprefix) {
    newlyGeneratedFiles = newlyGeneratedFiles.pipe(autoprefixer({ browsers: settings.scss.autoprefixerTargetBrowsers }));
  }

  newlyGeneratedFiles = newlyGeneratedFiles.pipe( concat(settings.scss.generatedSylesheetName) )
    .pipe( gulp.dest(`${paths.destination.root}/${paths.destination.css}`) )
    .pipe(browserSync.stream());

  return merge(previouslyGeneratedFiles, newlyGeneratedFiles);
}

const server = () => {
  browserSync.init({
    ...settings.server,
    files: settings.server.files.map(file => `${paths.source.root}/${file}` )
  });
  
  gulp.watch( settings.scss.watch.map(pattern => `${paths.source.root}/${pattern}`), generateCSS);
}

export default server;