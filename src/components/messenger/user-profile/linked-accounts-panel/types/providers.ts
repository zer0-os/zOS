export enum Provider {
  EpicGames = 'epic-games',
  Telegram = 'telegram',
}

export const ProviderLabels = {
  [Provider.EpicGames]: 'Epic Games',
  [Provider.Telegram]: 'Telegram',
};

export const ProviderLogos = {
  [Provider.EpicGames]: '/providers/epic-games.png',
  [Provider.Telegram]: '/providers/telegram.png',
};
