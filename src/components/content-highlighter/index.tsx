import React from 'react';
import { textToPlainEmojis } from './text-to-emojis';

import './styles.scss';

export interface Properties {
  message: string;
  mentionedUserIds?: any[];
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
        const mention = `@${match[1]}`;
        const props: { className: string; key: string; id?: string } = {
          className: 'content-highlighter__user-mention',
          key: match[3] + index,
        };

        if (profileId) {
          props.id = profileId;
        }

        return <span {...props}>{mention}</span>;
      }

      return part;
    });
  }

  render() {
    return <div>{this.renderContent(this.props.message)}</div>;
  }
}
