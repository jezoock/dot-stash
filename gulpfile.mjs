import gulp from "gulp";
import * as dartSass from 'sass';
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
export const generateThemeCSS = () => {
  let previouslyGeneratedFiles = gulp.src(`${paths.destination.root}/${paths.destination.css}/*.css` , { read: false });

  if(settings.scss.cleanDestinationDirectory) {
    previouslyGeneratedFiles = previouslyGeneratedFiles.pipe(clean({ force: true }));
  }

  let newlyGeneratedFiles = gulp
    .src(settings.scss.theme.sourceFiles)
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError));

  if (settings.scss.autoprefix) {
    newlyGeneratedFiles = newlyGeneratedFiles.pipe(autoprefixer({ browsers: settings.scss.autoprefixerTargetBrowsers }));
  }

  newlyGeneratedFiles = newlyGeneratedFiles.pipe( concat(settings.scss.theme.generatedSylesheetName) )
    .pipe(gulp.dest(`${paths.destination.root}/${paths.destination.css}`))
    .pipe(browserSync.stream());

  return merge(previouslyGeneratedFiles, newlyGeneratedFiles);
}

export const generatePagesCSS = (scssFile) => {
  let previouslyGeneratedFiles = gulp.src(`${paths.destination.root}/${paths.destination.css}/pages/*.css` , { read: false });
  let newlyGeneratedFiles = gulp
    .src(
        scssFile,
        {
          "base": `${paths.source.root}/${paths.source.css}/pages/`
        }
    ).pipe( 
      sass({
        outputStyle: "compressed",
        includePaths: [settings.scss.pages.sourceFiles]
      })
    );

  if (settings.scss.autoprefix) {
    newlyGeneratedFiles = newlyGeneratedFiles.pipe(autoprefixer({ browsers: settings.scss.autoprefixerTargetBrowsers }));
  }

  newlyGeneratedFiles = newlyGeneratedFiles
    .pipe( gulp.dest(`${paths.destination.root}/${paths.destination.css}/pages`) )
    .pipe( browserSync.stream() );

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
      tsResult.js.pipe(gulp.dest(`${paths.destination.root}/${paths.destination.scripts}`))
    ]);
}

export const generateImages = () => {
  return gulp.src('./images/*')
    .pipe(imagemin())
    .pipe(gulp.dest(`${paths.destination.root}/${paths.destination.images}`))
    .pipe(webp({ quality: 80 }))
    .pipe(gulp.dest(`${paths.destination.root}/${paths.destination.images}`))
}

const server = () => {
  browserSync.init({
    ...settings.server,
    files: settings.server.files.map(file => `${paths.source.root}/${file}` )
  });
  
  const themeStylesWatcher = gulp.watch( settings.scss.theme.watch.map(pattern => `${paths.source.root}/${pattern}`));
  themeStylesWatcher.on("change", generateThemeCSS)
  
  const pageStylesWatcher = gulp.watch( settings.scss.pages.watch.map(pattern => `${paths.source.root}/${pattern}`));
  pageStylesWatcher.on("change", generatePagesCSS);
  
  const scriptsWatcher = gulp.watch( settings.typescript.watch.map(pattern => `${paths.source.root}/${pattern}`));
  scriptsWatcher.on("change", generateScripts);
  
  /* const imagesWatcher = gulp.watch( settings.images.watch.map(pattern => `${paths.source.root}/${pattern}`));
  imagesWatcher.on("change", generateImages); */
}

export default server;