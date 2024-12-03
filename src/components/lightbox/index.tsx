import React, { useState, useEffect } from 'react';
import { default as ReactImageLightbox } from 'react-image-lightbox';
import { useEscapeManager } from './useEscapeManager';
import { IconCopy2, IconDownload2 } from '@zero-tech/zui/components/Icons';

import 'react-image-lightbox/style.css';
import styles from './styles.module.scss';

export interface LightboxProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
  startingIndex?: number;
  onClose?: () => void;
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
  const escapeManager = useEscapeManager();
  const currentItem = items[index];
  const isCurrentItemGif = currentItem?.mimetype === 'image/gif';

  useEffect(() => {
    escapeManager?.register(onClose);
    return () => escapeManager?.unregister();
  }, [escapeManager, onClose]);

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

  const activeItem = processedItems[index];
  const previousItem = processedItems.length > 1 ? processedItems[getPreviousItemIndex(index)] : null;
  const nextItem = processedItems.length > 1 ? processedItems[getNextItemIndex(index)] : null;

  return (
    <ReactImageLightbox
      mainSrc={activeItem}
      nextSrc={nextItem}
      prevSrc={previousItem}
      animationOnKeyInput
      enableZoom={false}
      wrapperClassName={styles.Lightbox}
      onCloseRequest={onClose}
      onMovePrevRequest={() => setIndex(getPreviousItemIndex(index))}
      onMoveNextRequest={() => setIndex(getNextItemIndex(index))}
      toolbarButtons={[
        !isCurrentItemGif && (
          <button key='copy' onClick={copyImage} className={styles.DownloadButton} aria-label='Copy image'>
            <IconCopy2 size={28} isFilled={isCopied} />
          </button>
        ),
        !isCurrentItemGif && (
          <button key='download' onClick={downloadImage} className={styles.DownloadButton} aria-label='Download image'>
            <IconDownload2 size={28} />
          </button>
        ),
      ].filter(Boolean)}
    />
  );
};
