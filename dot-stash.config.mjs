const DotstashConfig = {
  paths: {
    destination: {
      root: "../assets",
      css: "css",
      images: "images",
      components: "dot-stash",
      scripts: "scripts",
    },
    source: {
      root: ".",
      css: "scss",
      images: "images",
      components: "components",
      scripts: "typescript",
    }
  },
  gulp: {
    server: {
      proxy: "localhost",
      ws: true,
      files: ["**/*.php", "**/*.twig", "**/*.html", "**/*.htm"]
    },
    scss: {
      autoprefix: false,
      autoprefixerTargetBrowsers: ["last 2 versions"],
      cleanDestinationDirectory: true,
      generatedSylesheetName: "style.css",
      watch: ["./scss/**/*.scss"],
      sourceFiles: './scss/index.scss'
    },
    typescript : {
      watch: ["./typescript/**/*.ts"],
    }
  }
}

export default DotstashConfig;