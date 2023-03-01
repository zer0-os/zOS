import React from 'react';
import { Emoji } from 'emoji-mart';
import nodeEmoji from 'node-emoji';

// eslint-disable-next-line no-useless-escape
const emojiRegex = new RegExp('(:[a-zA-Z0-9-_+]+:(:skin-tone-[2-6]:)?)', 'g');

const fallback = (text) => () => text;

export const textToEmojis = (message: string) => {
  const nodes: React.ReactNode[] = [];

  const matches = message.matchAll(emojiRegex);
  let stringIndex = 0;
  for (const match of matches) {
    const beforeText = message.substring(stringIndex, match.index);
    if (beforeText) {
      nodes.push(<span key={nodes.length}>{beforeText}</span>);
    }
    const colon = match[0];
    nodes.push(
      <Emoji
        emoji={colon}
        key={nodes.length}
        size={19}
        fallback={fallback(colon)}
      />
    );
    stringIndex = match.index + colon.length;
  }
  const afterText = message.substr(stringIndex);
  if (afterText) {
    nodes.push(<span key={nodes.length}>{afterText}</span>);
  }

  return nodes;
};

export const textToPlainEmojis = (message: string) => {
  return nodeEmoji.emojify(message);
};
