export enum Provider {
  EpicGames = 'epic-games',
  Telegram = 'telegram',
  X = 'x',
}

export const ProviderLabels = {
  [Provider.EpicGames]: 'Epic Games',
  [Provider.Telegram]: 'Telegram',
  [Provider.X]: 'X',
};

export const ProviderLogos = {
  [Provider.EpicGames]: '/providers/epic-games.png',
  [Provider.Telegram]: '/providers/telegram.png',
  [Provider.X]: '/providers/x.png',
};
