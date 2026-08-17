import { readFile } from "node:fs/promises";

import { transformAsync } from "@babel/core";

const source = await readFile("src/index.ts", "utf8");
const result = await transformAsync(source, {
  babelrc: false,
  configFile: false,
  filename: "src/index.ts",
  plugins: [["babel-plugin-react-compiler", { target: "19" }]],
  presets: [["@babel/preset-typescript", { ignoreExtensions: true }]],
});

if (!result?.code) {
  throw new Error("React Compiler did not produce output.");
}

console.log("React Compiler accepted every exported hook.");
