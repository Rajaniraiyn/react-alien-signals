import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  treeshake: true,
  clean: true,
  dts: true,
  platform: "browser",
  splitting: true,
  sourcemap: true,
});
