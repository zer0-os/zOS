import React from 'react';
import { textToPlainEmojis } from './text-to-emojis';

import './styles.scss';
import Linkify from 'linkify-react';
import * as linkifyjs from 'linkifyjs';

export interface Properties {
  message: string;
  mentionedUserIds?: any[];
  variant?: 'negative';
  tabIndex?: number;
}

export class ContentHighlighter extends React.Component<Properties> {
  getProfileId(id: string): string | null {
    const user = (this.props.mentionedUserIds || []).find((user) => user.id === id);

    if (!user) return null;

    return user.profileId;
  }

  renderContent(message) {
    const parts = message.split(/(@\[.*?\]\([a-z]+:[A-Za-z0-9_-]+\))/gi);
    return parts.map((part, index) => {
      const match = part.match(/@\[(.*?)\]\(([a-z]+):([A-Za-z0-9_-]+)\)/i);

      if (!match) {
        return textToPlainEmojis(part);
      }

      if (match[2] === 'user') {
        const profileId = this.getProfileId(match[3]);
        const mention = `${match[1]}`.trim();
        const props: { className: string; key: string; id?: string } = {
          className: 'content-highlighter__user-mention',
          key: match[3] + index,
        };

        if (profileId) {
          props.id = profileId;
        }

        return (
          <span data-variant={this.props.variant} {...props}>
            {this.props.variant && '@'}
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
          <div>{this.renderContent(this.props.message)}</div>
        </Linkify>
      );
    } else {
      return <div className='content-highlighter'>{this.renderContent(this.props.message)}</div>;
    }
  }

  render() {
    return this.renderMessageWithLinks();
  }
}
