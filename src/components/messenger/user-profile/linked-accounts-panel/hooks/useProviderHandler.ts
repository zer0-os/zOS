import { Provider } from '../types/providers';
import { useEpicGamesLink } from './useEpicGamesLink';
import { useTelegramLink } from './useTelegramLink';

export const useProviderHandler = () => {
  const epicGamesLink = useEpicGamesLink();
  const telegramLink = useTelegramLink();

  const handle = (provider: Provider) => {
    if (provider === Provider.EpicGames) epicGamesLink();
    if (provider === Provider.Telegram) telegramLink();

    return null;
  };

  return handle;
};
