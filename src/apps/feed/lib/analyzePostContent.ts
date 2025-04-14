interface PostContentAnalysis {
  shouldTruncate: boolean;
  truncatedContent: string | null;
  lineBreakCount: number;
  characterCount: number;
}

/**
 * Analyzes post content to determine if it needs truncation and how it should be truncated.
 * Posts are truncated if they:
 * 1. Exceed 280 characters
 * 2. Have more than 3 line breaks
 *
 * @param content - The post content to analyze
 * @returns Analysis result containing truncation info
 */
export const analyzePostContent = (content: string | undefined | null): PostContentAnalysis => {
  if (!content) {
    return {
      shouldTruncate: false,
      truncatedContent: null,
      lineBreakCount: 0,
      characterCount: 0,
    };
  }

  const lineBreakCount = (content.match(/\n/g) || []).length;
  const characterCount = content.length;
  const shouldTruncate = characterCount > 280 || lineBreakCount > 3;

  if (!shouldTruncate) {
    return {
      shouldTruncate: false,
      truncatedContent: null,
      lineBreakCount,
      characterCount,
    };
  }

  let truncatedContent: string;
  if (lineBreakCount > 3) {
    truncatedContent = content.split('\n').slice(0, 3).join('\n');
  } else {
    truncatedContent = content.slice(0, 280);
  }

  return {
    shouldTruncate,
    truncatedContent,
    lineBreakCount,
    characterCount,
  };
};
