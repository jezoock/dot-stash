import gulp from "gulp";
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import clean from "gulp-clean";
/* import autoprefixer from "gulp-autoprefixer"; */
import merge from "merge-stream";
import concat from "gulp-concat";
import BrowserSync from "browser-sync";
import DotstashConfig from "./gulp.config.mjs";

const browserSync = BrowserSync.create();
const sass = gulpSass(dartSass);
const { paths } = DotstashConfig.gulp;

// gulpfile.js - css task
export const generateCSS = () => {
  let cleanCSS = gulp
    .src(paths.scss.compiledFiles, { read: false });

    if(DotstashConfig.gulp.settings.scss.cleanDestinationDirectory) {
      cleanCSS = cleanCSS.pipe(clean({ force: true }));

    }

  let sCSS = gulp
    .src(paths.scss.sourceFiles)
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError));

 /*  if (DotstashConfig.gulp.settings.scss.autoprefix) {
    sCSS = sCSS.pipe(autoprefixer({ browsers: ["last 2 versions"] }));
  } */

  sCSS = sCSS
    .pipe(concat("styles.css"))
    .pipe(gulp.dest(paths.scss.destinationFolder))
    .pipe(browserSync.stream());

  return merge(cleanCSS, sCSS);
}

export const refreshComponents = () => {
  let js = gulp.src(paths.components.sourceFiles).pipe(gulp.dest(paths.components.destinationFolder))
  .pipe(browserSync.stream());

}

// gulpfile.js - browsersync task
const server = () => {
  browserSync.init({
    proxy: "localhost",
    ws: true,
    files: ["./**/*.php", "./**/*.twig", "../**/*.html", "../**/*.htm"]
  });
  
  // gulp.watch(paths.components.watchedFiles, refreshComponents);
  gulp.watch(paths.scss.watchedFiles, generateCSS);
}

// gulpfile.js - default task
export default server;