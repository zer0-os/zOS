import { Provider } from '../types/providers';
import { epicGamesLink } from '../../../../../lib/oauth/epicGamesLink';
import { useTelegramLink } from '../../../../../lib/oauth/useTelegramLink';

export const useProviderHandler = () => {
  const telegramLink = useTelegramLink();

  const handle = (provider: Provider) => {
    if (provider === Provider.EpicGames) epicGamesLink();
    if (provider === Provider.Telegram) telegramLink();

    return null;
  };

  return handle;
};
