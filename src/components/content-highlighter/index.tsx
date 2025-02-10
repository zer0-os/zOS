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
}

const cn = bemClassName('content-highlighter');

export class ContentHighlighter extends React.Component<Properties> {
  renderContent(message) {
    const parts = message.split(/(@\[.*?\]\([a-z]+:[A-Za-z0-9_@:.-]+\))/gi);
    return parts.map((part, index) => {
      const match = part.match(/@\[(.*?)\]\(([a-z]+):([A-Za-z0-9_@:.-]+)\)/i);

      if (!match) {
        return textToPlainEmojis(part);
      }

      if (match[2] === 'user') {
        const mention = `${match[1]}`.trim();
        const props: { className: string } = {
          ...cn('user-mention'),
        };

        return (
          <span key={match[3] + index} data-variant={this.props.variant} {...props}>
            {this.props.variant === 'negative' && '@'}
            {mention}
          </span>
        );
      }
      return part;
    });
  }

  renderMessageWithLinks(): React.ReactElement {
    const { message } = this.props;
    const hasLinks = linkifyjs.find(message);

    if (hasLinks.length) {
      return (
        <Linkify
          options={{
            attributes: {
              target: '_blank',
              class: 'text-message__link',
              tabIndex: this.props.tabIndex || 0,
            },
          }}
        >
          <div {...cn('')}>{this.renderContent(this.props.message)}</div>
        </Linkify>
      );
    } else {
      return <div {...cn('')}>{this.renderContent(this.props.message)}</div>;
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
