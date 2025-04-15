import { describe, it, expect } from 'vitest';
import { analyzePostContent } from './analyzePostContent';

describe('analyzePostContent', () => {
  it('should handle empty content', () => {
    const result = analyzePostContent('');
    expect(result).toEqual({
      shouldTruncate: false,
      truncatedContent: null,
      lineBreakCount: 0,
      characterCount: 0,
    });
  });

  it('should handle null or undefined content', () => {
    expect(analyzePostContent(null)).toEqual({
      shouldTruncate: false,
      truncatedContent: null,
      lineBreakCount: 0,
      characterCount: 0,
    });

    expect(analyzePostContent(undefined)).toEqual({
      shouldTruncate: false,
      truncatedContent: null,
      lineBreakCount: 0,
      characterCount: 0,
    });
  });

  it('should not truncate content within limits', () => {
    const content = 'This is a normal post\nwith two\nline breaks';
    const result = analyzePostContent(content);
    expect(result).toEqual({
      shouldTruncate: false,
      truncatedContent: null,
      lineBreakCount: 2,
      characterCount: content.length,
    });
  });

  it('should truncate content with too many line breaks', () => {
    const content = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
    const result = analyzePostContent(content);
    expect(result).toEqual({
      shouldTruncate: true,
      truncatedContent: 'Line 1\nLine 2\nLine 3',
      lineBreakCount: 4,
      characterCount: content.length,
    });
  });

  it('should truncate content exceeding character limit', () => {
    const content = 'a'.repeat(300);
    const result = analyzePostContent(content);
    expect(result).toEqual({
      shouldTruncate: true,
      truncatedContent: 'a'.repeat(280),
      lineBreakCount: 0,
      characterCount: 300,
    });
  });

  it('should prioritize line break truncation over character count', () => {
    const content = 'a'.repeat(300) + '\n'.repeat(4);
    const result = analyzePostContent(content);
    const expectedLines = content.split('\n').slice(0, 3).join('\n');

    expect(result).toEqual({
      shouldTruncate: true,
      truncatedContent: expectedLines,
      lineBreakCount: 4,
      characterCount: content.length,
    });
  });
});
