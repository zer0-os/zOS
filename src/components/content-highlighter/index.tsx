import React from 'react';
import { textToPlainEmojis } from './text-to-emojis';
import { IconButton } from '@zero-tech/zui/components';
import { IconHelpCircle } from '@zero-tech/zui/icons';
import './styles.scss';
import Linkify from 'linkify-react';
import * as linkifyjs from 'linkifyjs';
import { bemClassName } from '../../lib/bem';

export interface Properties {
  message: string;
  variant?: 'negative' | 'tertiary';
  tabIndex?: number;
  isHidden?: boolean;
  onHiddenMessageInfoClick?: () => void;
  onImageReply?: (imageUrl: string) => void;
  imageUrl?: string;
}

const cn = bemClassName('content-highlighter');

export class ContentHighlighter extends React.Component<Properties> {
  renderContent(message: string, imageUrl?: string) {
    if (!message && !imageUrl) return null;
    const parts = message.split(/(@\[.*?\]\([a-z]+:[A-Za-z0-9_-]+\)|!\[.*?\]\([^\s)]+\))/gi);
    return parts.map((part, index) => {
      const mentionMatch = part.match(/@\[(.*?)\]\(([a-z]+):([A-Za-z0-9_-]+)\)/i);
      const imageMatch = part.match(/!\[(.*?)\]\(([^\s)]+)\)/i);

      if (mentionMatch && mentionMatch[2] === 'user') {
        const mention = mentionMatch[1].trim();
        return (
          <span {...cn('user-mention')} key={mentionMatch[3] + index}>
            {mention}
          </span>
        );
      } else if (imageMatch) {
        const imageSrc = imageUrl || imageMatch[2];
        return (
          <img
            key={index}
            src={imageSrc}
            alt={imageMatch[1]}
            onClick={() => this.props.onImageReply && this.props.onImageReply(imageSrc)}
          />
        );
      } else {
        return textToPlainEmojis(part);
      }
    });
  }

  renderMessageWithLinks(): React.ReactElement {
    const { message } = this.props;
    if (!message) return null;

    const isPureImage = /^!\[.*?\]\([^\s)]+\)$/.test(message);
    const hasLinks = message && !isPureImage && linkifyjs.test(message);

    if (hasLinks) {
      return (
        <Linkify
          options={{
            attributes: {
              target: '_blank',
              className: 'text-message__link',
              tabIndex: this.props.tabIndex || 0,
            },
          }}
        >
          {this.renderContent(message)}
        </Linkify>
      );
    } else {
      return <div className='content-highlighter'>{this.renderContent(message)}</div>;
    }
  }

  renderHiddenMessage(): React.ReactElement {
    return (
      <div {...cn('hidden-message-block')}>
        <span {...cn('hidden-message-text')}>{this.props.message}</span>
        <IconButton Icon={IconHelpCircle} size={24} onClick={this.props.onHiddenMessageInfoClick} />
      </div>
    );
  }

  render() {
    if (this.props.isHidden) {
      return this.renderHiddenMessage();
    }

    return this.renderMessageWithLinks();
  }
}
