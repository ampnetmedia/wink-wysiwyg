const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [],
    include: ["tests/**/*.{test,spec}.{js,ts,tsx}"],
    exclude: ["node_modules", "dist"],
    // Don't fail if no tests are found
    passWithNoTests: true,
  },
});
