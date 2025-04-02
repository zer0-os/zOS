import * as React from 'react';
import { ContentHighlighter } from '../../content-highlighter';
import { bemClassName } from '../../../lib/bem';
import { useMatrixMedia } from '../../../lib/hooks/useMatrixMedia';
import { Media } from '../../../store/messages';
import { IconCornerDownRight, IconPaperclip, IconVolumeMax } from '@zero-tech/zui/icons';

import './styles.scss';

const cn = bemClassName('parent-message-container');

export interface Properties {
  message: string;
  senderIsCurrentUser: boolean;
  senderFirstName: string;
  senderLastName: string;
  media: Media;
  messageId: string;
  onMessageClick: (messageId: string) => void;
}

export function ParentMessage({
  message,
  senderIsCurrentUser,
  senderFirstName,
  senderLastName,
  media,
  messageId,
  onMessageClick,
}: Properties) {
  const { data: effectiveMediaUrl } = useMatrixMedia(media);

  const handleClick = () => {
    if (messageId) {
      onMessageClick(messageId);
    }
  };

  const name = senderIsCurrentUser ? 'You' : `${senderFirstName} ${senderLastName}`;

  if (!message && !effectiveMediaUrl) {
    return null;
  }

  return (
    <div {...cn('')} onClick={handleClick} role='button' tabIndex={0}>
      <div {...cn('parent-message')}>
        <IconCornerDownRight size={16} />

        {media?.name && (
          <div {...cn('media-container', (media?.type === 'file' || media?.type === 'audio') && 'file')}>
            {effectiveMediaUrl && media?.type === 'image' && (
              <img {...cn('media')} src={effectiveMediaUrl} alt={media?.name} />
            )}

            {effectiveMediaUrl && media?.type === 'video' && <video {...cn('media')} src={effectiveMediaUrl} />}

            {effectiveMediaUrl && media?.type === 'audio' && (
              <div {...cn('media', 'file')}>
                <IconVolumeMax {...cn('audio-icon')} isFilled size={18} />
              </div>
            )}

            {effectiveMediaUrl && media?.type === 'file' && (
              <div {...cn('media', 'file')}>
                <IconPaperclip {...cn('file-icon')} isFilled size={18} />
              </div>
            )}

            {!effectiveMediaUrl && <div {...cn('image-placeholder')} />}
          </div>
        )}

        <div {...cn('content')}>
          <div {...cn('header')}>{name}</div>

          {message && (
            <span {...cn('message')}>
              <ContentHighlighter variant='tertiary' message={message} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
