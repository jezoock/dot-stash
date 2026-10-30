const DotstashConfig = {
  paths: {
    source: {
      root: ".",
      css: "scss",
      images: "images",
      scripts: "typescript",
    },
    destination: {
      root: "dist",
      css: "css",
      images: "images",
      scripts: "js",
    },
  },
  gulp: {
    server: {
      server: { baseDir: "." },
      watchOptions: { ignored: ["**/node_modules/**"] },
      files: ["**/*.html", "**/*.htm", "www/build/*.*"]
    },
    scss: {
      autoprefix: false,
      autoprefixerTargetBrowsers: ["last 2 versions"],
      cleanDestinationDirectory: true,
      theme: {
        generatedSylesheetName: "style.css",
        watch: ["./scss/**/*.scss", "!./scss/pages/**/*"],
        sourceFiles: './scss/index.scss'
      },
      pages: {
        generatedSylesheetName: "style.css",
        watch: ["./scss/pages/*.scss"],
        sourceFiles: './scss/pages.scss'
      }
    },
    typescript : {
      watch: ["./typescript/**/*.ts"],
    }
  }
}

export default DotstashConfig;