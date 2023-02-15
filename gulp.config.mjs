const DotstashConfig = {
  gulp: {
    paths: {
      scss: {
        destinationFolder: "../assets/css",
        compiledFiles: "../assets/**/*.css",
        sourceFiles: "./scss/index.scss",
        watchedFiles: ["scss/**/*.scss"],
      },
      images: {
        destinationFolder: "../assets/images",
        optimizedImages: '../assets/*.*',
        sourceFiles: "./images/*.*",
        watchedFiles: ["images/**/*.*"],
      },
      components: {
        watchedFiles: ["dist/dot-stash/*.*"],
        sourceFiles: "./dist/dot-stash/*.*",
        destinationFolder: "../assets/js/dot-stash",
      }
    },
    settings: {
      scss: {
        autoprefix: false,
        cleanDestinationDirectory: true,
      }
    }
  }
}

export default DotstashConfig;