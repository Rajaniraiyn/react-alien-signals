import { rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });

const bundle = await Bun.build({
  entrypoints: ["src/index.ts"],
  outdir: "dist",
  target: "browser",
  format: "esm",
  packages: "external",
  splitting: true,
  minify: true,
  sourcemap: "linked",
});

if (!bundle.success) {
  for (const message of bundle.logs) {
    console.error(message);
  }
  process.exit(1);
}

const declarations = Bun.spawn(
  [process.execPath, "x", "tsc", "--project", "tsconfig.build.json"],
  {
    stdout: "inherit",
    stderr: "inherit",
  },
);

const declarationExitCode = await declarations.exited;

if (declarationExitCode !== 0) {
  process.exit(declarationExitCode);
}
