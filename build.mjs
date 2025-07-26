import { context } from "esbuild";

const ctx = await context({
  entryPoints: ["index.ts"],
  bundle: true,
  minify: false,
  outdir: ".",
})


await ctx.watch();
