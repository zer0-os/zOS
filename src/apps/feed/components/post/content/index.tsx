import { useCallback, useMemo, useState } from 'react';

import Linkify from 'linkify-react';
import { detectLinkType } from '../link-preview/utils';
import { PostLinkPreview } from '../link-preview';
import { analyzePostContent } from '../../../lib/analyzePostContent';
import { ShowMoreButton } from '../../show-more-button';

import classNames from 'classnames';
import styles from './styles.module.scss';

export const Content = ({ text, isSinglePostView }: { text: string; isSinglePostView: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { shouldTruncate, truncatedContent } = useMemo(() => analyzePostContent(text), [text]);

  const shouldShowTruncation = !isSinglePostView && shouldTruncate;

  const displayText = useMemo(() => {
    if (!text || !shouldShowTruncation || isExpanded) return text;
    return truncatedContent;
  }, [
    text,
    shouldShowTruncation,
    isExpanded,
    truncatedContent,
  ]);

  const multilineText = useMemo(
    () => (
      <div className={styles.TextContainer}>
        {displayText.split('\n').map((line, index) => {
          const linkType = detectLinkType(line);
          const hasPreview = linkType !== null;

          return (
            <div key={index} className={styles.TextLine}>
              <span className={styles.Text}>{line}</span>
              {hasPreview && <PostLinkPreview url={line} />}
            </div>
          );
        })}
      </div>
    ),
    [displayText]
  );

  const handleExpand = useCallback(() => {
    setIsExpanded(true);
  }, []);

  return (
    <div className={classNames(styles.Content, { [styles.Truncated]: shouldShowTruncation && !isExpanded })}>
      <Linkify options={{ render: renderLink }}>{multilineText}</Linkify>
      {shouldShowTruncation && !isExpanded && <ShowMoreButton onClick={handleExpand} />}
    </div>
  );
};

const renderLink = ({ attributes, content }) => {
  const { href, ...props } = attributes;
  return (
    <a
      onClick={(e) => e.stopPropagation()}
      className={styles.Link}
      href={href}
      target='_blank'
      rel='noreferrer'
      {...props}
    >
      {content}
    </a>
  );
};
