import * as esbuild from "esbuild";
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const watch = process.argv.includes("--watch");

/** @type {import('esbuild').BuildOptions} */
const options = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "dist/songwriters-pad.js",
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

// Optional: auto-copy into Spicetify's Extensions folder after build.
// Set once in your shell:
//   Windows PowerShell: $env:SPICETIFY_EXTENSIONS = "C:\Users\mifah\.spicetify\Extensions"
// Then `pnpm build` / `pnpm dev` keeps the installed copy up to date.
function maybeDeploy() {
  const dir = process.env.SPICETIFY_EXTENSIONS;
  if (!dir) return;
  mkdirSync(dir, { recursive: true });
  copyFileSync(options.outfile, join(dir, "songwriters-pad.js"));
  console.log(`deployed -> ${join(dir, "songwriters-pad.js")}`);
}

if (watch) {
  const ctx = await esbuild.context({
    ...options,
    plugins: [{ name: "deploy", setup: (b) => b.onEnd(maybeDeploy) }],
  });
  await ctx.watch();
  console.log("watching...");
} else {
  await esbuild.build(options);
  maybeDeploy();
}
