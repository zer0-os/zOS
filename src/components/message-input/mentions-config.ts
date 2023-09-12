import { emojiIndex } from 'emoji-mart';
import ifEmoji from 'if-emoji';

export interface MentionsConfig {
  markup: string;
  regex: RegExp;
  regexGlobal: RegExp;
  displayTransform: (id: string, display: string) => string;
}

export const userMentionsConfig: MentionsConfig = {
  markup: '@[__display__](user:__id__)',
  //eslint-disable-next-line
  regex: /@\[(.+?)\]\(user:([A-Za-z0-9_\-]+)\)/,
  //eslint-disable-next-line
  regexGlobal: /@\[(.+?)\]\(user:([A-Za-z0-9_\-]+)\)/gi,
  displayTransform: (_, display) => {
    return `${display.trim()}`;
  },
};

export const quoteMentionsConfig: MentionsConfig = {
  markup: '@[__display__](quote:__id__)',
  regex: /@\[(.+?)]\(quote:(.+?)\)/,
  regexGlobal: /@\[(.+?)]\(quote:(.+?)\)/gi,
  displayTransform: (_, display) => {
    return `"${display.replace(/<br \/>/g, '\n')}"`;
  },
};

export const tagMentionsConfig: MentionsConfig = {
  markup: '@[__display__](tag:__id__)',
  regex: /@\[([A-Za-z0-9_]+)\]\(tag:([A-Za-z0-9_]+)\)/,
  regexGlobal: /@\[([A-Za-z0-9_]+)\]\(tag:([A-Za-z0-9_]+)\)/gi,
  displayTransform: (_, display) => {
    return `#${display}`;
  },
};

const EMOJI_CACHE: Record<string, string> = {};

export const emojiMentionsConfig: MentionsConfig = {
  markup: ':__id__:',
  regex: /:([a-zA-Z0-9-_+]+):/,
  regexGlobal: /:([a-zA-Z0-9-_+]+):/gi,
  displayTransform: (id) => {
    if (EMOJI_CACHE[id]) {
      return EMOJI_CACHE[id];
    }

    const emojis = emojiIndex.search(id);
    if (emojis.length) {
      const foundEmoji = emojis[0] as { short_names: string[]; native: string };
      const emoji = foundEmoji.native;
      if (foundEmoji.short_names.includes(id) && ifEmoji(emoji)) {
        EMOJI_CACHE[id] = emoji;
        return EMOJI_CACHE[id];
      }
    }

    EMOJI_CACHE[id] = `:${id}:`;
    return EMOJI_CACHE[id];
  },
};

export const mentionsConfigs: MentionsConfig[] = [
  userMentionsConfig,
  quoteMentionsConfig,
  tagMentionsConfig,
  emojiMentionsConfig,
];
