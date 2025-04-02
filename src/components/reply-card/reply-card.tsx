import React from 'react';
import { ContentHighlighter } from '../content-highlighter';
import { bemClassName } from '../../lib/bem';
import { IconCornerDownRight, IconPaperclip, IconVolumeMax, IconXClose } from '@zero-tech/zui/icons';
import { IconButton } from '@zero-tech/zui/components';
import { useMatrixMedia } from '../../lib/hooks/useMatrixMedia';
import { Media } from '../../store/messages';

import './styles.scss';

const cn = bemClassName('reply-card');

export interface Properties {
  message: string;
  senderIsCurrentUser: boolean;
  senderFirstName: string;
  senderLastName: string;
  media: Media;
  onRemove?: () => void;
}

export default function ReplyCard({
  message,
  senderIsCurrentUser,
  senderFirstName,
  senderLastName,
  media,
  onRemove,
}: Properties) {
  const { data: effectiveMediaUrl } = useMatrixMedia(media);

  const name = senderIsCurrentUser ? 'You' : `${senderFirstName} ${senderLastName}`;

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    }
  };

  if (!message && !effectiveMediaUrl) {
    return null;
  }

  return (
    <div {...cn()}>
      <IconCornerDownRight size={16} />

      {effectiveMediaUrl && media?.type === 'image' && (
        <div {...cn('media-container')}>
          <img {...cn('media')} src={effectiveMediaUrl} alt={media?.name} />
        </div>
      )}

      {effectiveMediaUrl && media?.type === 'video' && (
        <div {...cn('media-container')}>
          <video {...cn('media')} src={effectiveMediaUrl} />
        </div>
      )}

      {effectiveMediaUrl && media?.type === 'audio' && (
        <div {...cn('media-container', 'file')}>
          <IconVolumeMax {...cn('audio-icon')} isFilled size={18} />
        </div>
      )}

      {effectiveMediaUrl && media?.type === 'file' && (
        <div {...cn('media-container', 'file')}>
          <IconPaperclip {...cn('file-icon')} isFilled size={18} />
        </div>
      )}

      <div {...cn('content')}>
        <div {...cn('header')}>{name}</div>

        {message && (
          <div {...cn('message')}>
            <ContentHighlighter variant='tertiary' message={message} />
          </div>
        )}
      </div>
      <IconButton Icon={IconXClose} size={24} onClick={handleRemove} />
    </div>
  );
}
