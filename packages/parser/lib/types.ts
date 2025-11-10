import { SyntaxConfig } from "@blue-water-autonomy/html-eslint-template-syntax-parser";

export type ParserOptions = {
  templateEngineSyntax?: SyntaxConfig;
  frontmatter?: boolean;
  rawContentTags?: string[];
};
