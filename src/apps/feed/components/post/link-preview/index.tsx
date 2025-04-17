import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import styles from './styles.module.scss';
import { detectLinkType, fetchPreviewFromUrl } from './utils';

export type PostLinkPreviewType = 'youtube';

export interface PostLinkPreviewData {
  title: string;
  thumbnailUrl?: string;
  authorName?: string;
  authorHandle?: string;
  videoId?: string;
}

interface PostLinkPreviewProps {
  url: string;
  className?: string;
}

export const PostLinkPreview: React.FC<PostLinkPreviewProps> = ({ url, className }) => {
  const [previewData, setPreviewData] = useState<PostLinkPreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<PostLinkPreviewType | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const linkType = detectLinkType(url);
    if (!linkType) {
      return;
    }
    setType(linkType);
  }, [url]);

  useEffect(() => {
    if (!type) return;

    const fetchData = async () => {
      try {
        setError(null);
        const data = await fetchPreviewFromUrl(url, type);
        setPreviewData(data);
      } catch (err) {
        setError('Failed to load preview');
        console.error('Error fetching link preview:', err);
      }
    };

    fetchData();
  }, [url, type]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewData?.videoId) {
      setIsPlaying(true);
    }
  };

  if (!type) return null;

  if (error || !previewData) {
    return null;
  }

  return (
    <div className={classNames(styles.Container, className, { [styles.Playing]: isPlaying })} onClick={handleClick}>
      {isPlaying ? (
        <div className={styles.VideoWrapper}>
          <iframe
            className={styles.VideoPlayer}
            src={`https://www.youtube.com/embed/${previewData?.videoId}?autoplay=1`}
            title={previewData?.title || ''}
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen
          />
        </div>
      ) : (
        <div className={styles.Thumbnail}>
          <img src={previewData?.thumbnailUrl} alt={previewData?.title || ''} />
          <div className={styles.PlayButton}>
            <svg viewBox='0 0 24 24' fill='currentColor'>
              <path d='M8 5v14l11-7z' />
            </svg>
          </div>
        </div>
      )}
      <div className={styles.Content}>
        <div className={styles.Title}>{previewData?.title}</div>
        {previewData?.authorName && (
          <div className={styles.Author}>
            {previewData.authorName}
            {previewData?.authorHandle && <span className={styles.Handle}>{previewData.authorHandle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
