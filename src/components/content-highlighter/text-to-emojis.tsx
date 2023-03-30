import nodeEmoji from 'node-emoji';

export const textToPlainEmojis = (message: string) => {
  return nodeEmoji.emojify(message);
};
