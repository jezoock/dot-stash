const DotstashConfig = {
  paths: {
    destination: {
      root: "../assets",
      css: "css",
      images: "images",
      components: "dot-stash",
      scripts: "js",
    },
    source: {
      root: ".",
      css: "scss",
      images: "images",
      components: "components",
      scripts: "js",
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
      watch: ["**/*.scss"],
    },
  }
}

export default DotstashConfig;