import type { Root } from "hast";

export function remarkFixKaTeXUnicode() {
  return (tree: Root) => {
    function visit(node: any) {
      if (node.type === "inlineMath" || node.type === "math") {
        if (node.value) {
          node.value = node.value
            .replace(/\u00A0/g, " ")
            .replace(/\u2011/g, "-")
            .replace(/\u2022/g, "\\bullet");
        }
      }
      if (node.type === "text" && node.value) {
        node.value = node.value
          .replace(/\u00A0/g, " ")
          .replace(/\u2011/g, "-")
          .replace(/\u2022/g, "\u2022");
      }
      if (node.children) {
        node.children.forEach(visit);
      }
    }
    visit(tree);
    return tree;
  };
}
