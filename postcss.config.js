module.exports = (ctx) => {
  return {
    map: ctx.options.map,
    plugins: {
      // Inlines `@import`, so each stylesheet in assets/styles is served as a single file
      "postcss-import": {},
      "postcss-nesting": {},
      autoprefixer: {},
      cssnano: {},
    },
  };
};
