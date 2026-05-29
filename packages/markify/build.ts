import { build } from 'bun';

const isWatch = process.argv.includes('--watch');

const external = [
  'react',
  'react-dom',
  'react-markdown',
  'remark-gfm',
  'remark-math',
  'rehype-katex',
  'katex',
  'mermaid',
];

const configs = [
  { entry: './src/index.jsx', out: './dist/index.js' },
  { entry: './src/plugins/code.js', out: './dist/plugins/code.js' },
  { entry: './src/plugins/math.js', out: './dist/plugins/math.js' },
  { entry: './src/plugins/mermaid.js', out: './dist/plugins/mermaid.js' },
];

async function buildAll() {
  for (const config of configs) {
    await build({
      entryPoints: [config.entry],
      outfile: config.out,
      bundle: true,
      minify: !isWatch,
      sourcemap: isWatch,
      format: 'esm',
      target: 'es2020',
      external,
    });
  }
  console.log('Built successfully!');
}

buildAll().catch(() => process.exit(1));
