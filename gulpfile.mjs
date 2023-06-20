import gulp from "gulp";
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import clean from "gulp-clean";
import autoprefixer from "gulp-autoprefixer";
import merge from "merge2";
import concat from "gulp-concat";
import BrowserSync from "browser-sync";
import DotstashConfig from "./dot-stash.config.mjs";
import ts from "gulp-typescript";
import imagemin from 'gulp-imagemin';
import webp from "gulp-webp";

const browserSync = BrowserSync.create();
const sass = gulpSass(dartSass);
const { paths, gulp: settings } = DotstashConfig;

// gulpfile.js - css task
export const generateCSS = () => {
  let previouslyGeneratedFiles = gulp.src(`${paths.destination.root}/${paths.destination.css}/**/*.css` , { read: false });

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
    .pipe(gulp.dest(`${paths.destination.root}/${paths.destination.css}`))
    .pipe(browserSync.stream());

  return merge(previouslyGeneratedFiles, newlyGeneratedFiles);
}

export const generateScripts = () => {
  const tsResult = gulp.src(`${paths.source.root}/${paths.source.scripts}/**/*.ts`)
    .pipe(
      ts({
        declaration: true
      })
    );

    return merge([
      tsResult.dts.pipe(gulp.dest(`${paths.destination.root}/${paths.destination.scripts}/definitions`)),
      tsResult.js.pipe(gulp.dest(`${paths.destination.root}/${paths.destination.scripts}/js`))
    ]);
}

export const generateImages = () => {
  return gulp.src('./images/*')
    .pipe(imagemin())
    .pipe(gulp.dest(`${paths.destination.root}/${paths.destination.images}`))
    .pipe(webp({ quality: 75 }))
    .pipe(gulp.dest(`${paths.destination.root}/${paths.destination.images}`))
}

const server = () => {
  browserSync.init({
    ...settings.server,
    files: settings.server.files.map(file => `${paths.source.root}/${file}` )
  });
  
  gulp.watch( settings.scss.watch.map(pattern => `${paths.source.root}/${pattern}`), generateCSS);
  gulp.watch( settings.typescript.watch.map(pattern => `${paths.source.root}/${pattern}`), generateScripts);
  gulp.watch( settings.images.watch.map(pattern => `${paths.source.root}/${pattern}`), generateImages);
}

export default server;