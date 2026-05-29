import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export const math = {
  remarkPlugins: [remarkMath],
  rehypePlugins: [rehypeKatex],
};

export function createMathPlugin() {
  return math;
}

export default math;
