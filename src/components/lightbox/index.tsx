import React, { useState } from 'react';
import {
  IconChevronLeft,
  IconChevronRight,
  IconCopy2,
  IconDownload2,
  IconXClose,
} from '@zero-tech/zui/components/Icons';
import { IconButton, Modal as ZuiModal } from '@zero-tech/zui/components';

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

  const getPreviousItemIndex = (currentIndex: number) => {
    return (currentIndex + items.length - 1) % items.length;
  };

  const getNextItemIndex = (currentIndex: number) => {
    return (currentIndex + items.length + 1) % items.length;
  };

  const processedItems = items.map((media) => {
    if (media.type === 'image') {
      const options = provider.fitWithinBox(media);
      return provider.getSource({ src: media.url, options });
    }
    return media.url;
  });

  return (
    <ZuiModal open={true} onOpenChange={() => onClose?.()} className={styles.Lightbox}>
      <div className={styles.Container}>
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

        <div className={styles.Content}>
          {items.length > 1 && (
            <IconButton
              className={styles.NavButton}
              onClick={() => setIndex(getPreviousItemIndex(index))}
              Icon={IconChevronLeft}
              size='large'
            />
          )}

          <div className={styles.ImageContainer}>
            <img src={processedItems[index]} alt='' className={styles.Image} />
          </div>

          {items.length > 1 && (
            <IconButton
              className={styles.NavButton}
              onClick={() => setIndex(getNextItemIndex(index))}
              Icon={IconChevronRight}
              size='large'
            />
          )}
        </div>
      </div>
    </ZuiModal>
  );
};
