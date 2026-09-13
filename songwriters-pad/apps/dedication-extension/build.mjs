import * as esbuild from "esbuild";
import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const watch = process.argv.includes("--watch");

const options = {
  entryPoints: ["src/index.tsx"],
  bundle: true,
  outfile: "dist/dedication.js",
  format: "iife",
  target: "es2022",
  minify: !watch,
  sourcemap: watch ? "inline" : false,
  jsx: "transform",
  jsxFactory: "Spicetify.React.createElement",
  jsxFragment: "Spicetify.React.Fragment",
  external: ["react", "react-dom"],
  logLevel: "info",
};

function maybeDeploy() {
  try {
      const fallbackDir = join(process.env.USERPROFILE, 'AppData', 'Roaming', 'spicetify', 'Extensions');
      mkdirSync(fallbackDir, { recursive: true });
      copyFileSync(options.outfile, join(fallbackDir, "dedication.js"));
  } catch (e) {}
}

if (watch) {
  const ctx = await esbuild.context({
    ...options,
    plugins: [{ name: "deploy", setup: (b) => b.onEnd(maybeDeploy) }],
  });
  await ctx.watch();
} else {
  await esbuild.build(options);
  maybeDeploy();
}
