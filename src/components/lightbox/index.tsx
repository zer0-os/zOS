import React, { useCallback, useEffect, useState } from 'react';
import {
  IconChevronLeft,
  IconChevronRight,
  IconCopy2,
  IconDownload2,
  IconXClose,
} from '@zero-tech/zui/components/Icons';
import { IconButton } from '@zero-tech/zui/components';

import styles from './styles.module.scss';

export interface LightboxProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
  startingIndex?: number;
  onClose?: (e?: React.MouseEvent) => void;
  provider: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fitWithinBox: (media: any) => any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSource: (options: { src: string; options: any }) => string;
  };
}

export const Lightbox = ({ items, startingIndex = 0, onClose, provider }: LightboxProps) => {
  const [index, setIndex] = useState(startingIndex);
  const [isCopied, setIsCopied] = useState(false);
  const currentItem = items[index];
  const isCurrentItemGif = currentItem?.mimetype === 'image/gif';

  const copyImage = async () => {
    const currentItem = items[index];
    if (!currentItem?.url) return;

    try {
      const response = await fetch(currentItem.url);
      const blob = await response.blob();

      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (writeError) {
        // Fallback: Create a temporary canvas to handle image copying
        const img = new Image();
        img.crossOrigin = 'anonymous';

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = currentItem.url;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context');

        ctx.drawImage(img, 0, 0);

        try {
          await canvas.toBlob(async (blob) => {
            if (blob) {
              await navigator.clipboard.write([
                new ClipboardItem({
                  'image/png': blob,
                }),
              ]);
              setIsCopied(true);
              setTimeout(() => setIsCopied(false), 2000);
            }
          }, 'image/png');
        } catch (canvasError) {
          throw new Error('Failed to copy image using canvas fallback');
        }
      }
    } catch (err) {
      console.error('Failed to copy image:', err);
    }
  };

  const downloadImage = () => {
    const currentItem = items[index];
    if (!currentItem || !currentItem.url) return;

    const link = document.createElement('a');
    link.href = currentItem.url;
    link.download = currentItem.name || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPreviousItemIndex = useCallback(
    (currentIndex: number) => {
      return (currentIndex + items.length - 1) % items.length;
    },
    [items]
  );

  const getNextItemIndex = useCallback(
    (currentIndex: number) => {
      return (currentIndex + items.length + 1) % items.length;
    },
    [items]
  );

  const processedItems = items.map((media) => {
    if (media.type === 'image') {
      const options = provider.fitWithinBox(media);
      return provider.getSource({ src: media.url, options });
    }
    return media.url;
  });

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose?.(e);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          if (items.length > 1) {
            setIndex(getPreviousItemIndex(index));
          }
          break;
        case 'ArrowRight':
          if (items.length > 1) {
            setIndex(getNextItemIndex(index));
          }
          break;
        case 'Escape':
          onClose?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    getNextItemIndex,
    getPreviousItemIndex,
    index,
    items.length,
    onClose,
  ]);

  return (
    <div className={styles.Overlay} onClick={handleOverlayClick}>
      <div className={styles.Controls}>
        <div className={styles.TopBar}>
          <div className={styles.Tools}>
            {!isCurrentItemGif && (
              <>
                <IconButton onClick={copyImage} Icon={IconCopy2} size='large' isFilled={isCopied} />
                <IconButton onClick={downloadImage} Icon={IconDownload2} size='large' />
              </>
            )}
          </div>
          <IconButton onClick={onClose} Icon={IconXClose} size='large' />
        </div>

        {items.length > 1 && (
          <>
            <IconButton
              className={`${styles.NavButton} ${styles.NavButtonLeft}`}
              onClick={() => setIndex(getPreviousItemIndex(index))}
              Icon={IconChevronLeft}
              size='large'
            />
            <IconButton
              className={`${styles.NavButton} ${styles.NavButtonRight}`}
              onClick={() => setIndex(getNextItemIndex(index))}
              Icon={IconChevronRight}
              size='large'
            />
          </>
        )}
      </div>

      <div className={styles.Container}>
        <div className={styles.Content}>
          <div className={styles.ImageContainer}>
            <img src={processedItems[index]} alt='' className={styles.Image} />
          </div>
        </div>
      </div>
    </div>
  );
};
