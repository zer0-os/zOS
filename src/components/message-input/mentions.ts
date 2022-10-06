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
    return `@${display}`;
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

export const mentionsConfigs: MentionsConfig[] = [
  userMentionsConfig,
  quoteMentionsConfig,
  tagMentionsConfig,
];
