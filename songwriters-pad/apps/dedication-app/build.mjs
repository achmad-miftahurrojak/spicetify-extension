import * as esbuild from "esbuild";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const watch = process.argv.includes("--watch");

const options = {
  entryPoints: ["src/index.tsx"],
  bundle: true,
  outfile: "dist/index.js",
  format: "iife",
  globalName: "DedicationApp",
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
  const code = readFileSync(options.outfile, 'utf-8');
  // Spicetify CLI forcibly appends `return render;` to Custom Apps.
  // We must define `render` globally so it doesn't throw ReferenceError.
  writeFileSync(options.outfile, code + '\nvar render = DedicationApp.default;\n');

  try {
      const fallbackDir = join(process.env.USERPROFILE, 'AppData', 'Roaming', 'spicetify', 'CustomApps', 'dedication');
      mkdirSync(fallbackDir, { recursive: true });
      copyFileSync(options.outfile, join(fallbackDir, "index.js"));
      copyFileSync("manifest.json", join(fallbackDir, "manifest.json"));
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
