const DotstashConfig = {
  paths: {
    source: {
      root: ".",
      css: "scss",
      images: "images",
      components: "dist/dot-stash/*.*",
      scripts: "typescript",
    },
    destination: {
      root: "../assets",
      css: "css",
      images: "images",
      components: "dot-stash",
      scripts: "js",
    },
  },
  gulp: {
    server: {
      proxy: "localhost",
      ws: true,
      files: ["**/*.php", "**/*.twig", "**/*.html", "**/*.htm", "dist/*.*"]
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
    },
    components : {
      watch: ["./dist/**/*.*"],
    }
  }
}

export default DotstashConfig;