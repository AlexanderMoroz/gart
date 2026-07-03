import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  target: 'node22',
  clean: true,
  sourcemap: true,
  // Bundle everything (workspace packages and node_modules) into one file so
  // the Docker image needs no node_modules. Revisit if a dep with native
  // bindings ever lands.
  noExternal: [/.*/],
  banner: {
    js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
  },
})
