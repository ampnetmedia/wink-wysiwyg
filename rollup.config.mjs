import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import tailwindcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";

export default [
  // CommonJS build
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "cjs",
      sourcemap: true,
      exports: "named",
    },
    external: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "@tiptap/react",
      "@tiptap/starter-kit",
      "@tiptap/extension-underline",
      "@tiptap/extension-link",
      "@tiptap/extension-image",
      "@tiptap/extension-placeholder",
      "@tiptap/extension-text-align",
      "lucide-react",
      "isomorphic-dompurify",
    ],
    plugins: [
      peerDepsExternal(),
      resolve({
        browser: true,
        preferBuiltins: false,
        dedupe: ["react", "react-dom"],
      }),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: true,
        declarationDir: "./dist",
        exclude: ["**/*.test.*", "**/*.spec.*"],
        declarationMap: true,
        emitDeclarationOnly: false,
      }),
      postcss({
        extract: true,
        minimize: true,
        plugins: [tailwindcss, autoprefixer],
      }),
      replace({
        "process.env.NODE_ENV": JSON.stringify("production"),
        preventAssignment: true,
      }),
    ],
  },
  // ES Module build
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.esm.js",
      format: "esm",
      sourcemap: true,
    },
    external: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "@tiptap/react",
      "@tiptap/starter-kit",
      "@tiptap/extension-underline",
      "@tiptap/extension-link",
      "@tiptap/extension-image",
      "@tiptap/extension-placeholder",
      "@tiptap/extension-text-align",
      "lucide-react",
      "isomorphic-dompurify",
    ],
    plugins: [
      peerDepsExternal(),
      resolve({
        browser: true,
        preferBuiltins: false,
        dedupe: ["react", "react-dom"],
      }),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false,
        exclude: ["**/*.test.*", "**/*.spec.*"],
      }),
      postcss({
        extract: true,
        minimize: true,
        plugins: [tailwindcss, autoprefixer],
      }),
      replace({
        "process.env.NODE_ENV": JSON.stringify("production"),
        preventAssignment: true,
      }),
    ],
  },
  // Client entry build (ESM)
  {
    input: "src/client.ts",
    output: {
      file: "dist/client.js",
      format: "esm",
      sourcemap: true,
    },
    external: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "@tiptap/react",
      "@tiptap/starter-kit",
      "@tiptap/extension-underline",
      "@tiptap/extension-link",
      "@tiptap/extension-image",
      "@tiptap/extension-placeholder",
      "@tiptap/extension-text-align",
      "lucide-react",
      "isomorphic-dompurify",
    ],
    plugins: [
      peerDepsExternal(),
      resolve({
        browser: true,
        preferBuiltins: false,
        dedupe: ["react", "react-dom"],
      }),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false,
        exclude: ["**/*.test.*", "**/*.spec.*"],
      }),
      postcss({
        extract: true,
        minimize: true,
        plugins: [tailwindcss, autoprefixer],
      }),
      replace({
        "process.env.NODE_ENV": JSON.stringify("production"),
        preventAssignment: true,
      }),
    ],
  },
];
