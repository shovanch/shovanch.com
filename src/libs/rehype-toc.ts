import { findAndReplace } from 'hast-util-find-and-replace';
import { visit } from 'unist-util-visit';

type VFile = {
  data: {
    astro: {
      frontmatter: {
        showToc?: boolean;
      };
    };
  };
};

export const rehypeToc: any = () => {
  return (tree: any, file: VFile) => {
    let replaced = false;
    visit(tree, (node) => {
      findAndReplace(node, [
        /\[\[toc\]\]/gi,
        (text) => {
          if (!replaced) {
            file.data.astro.frontmatter.showToc = true;
            replaced = true;
            return;
          }
          return text; // Return the original text if already replaced
        },
      ]);
    });
  };
};
