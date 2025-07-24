import { Provider } from '../types/providers';
import { useTelegramLink } from '../../../../../lib/oauth/useTelegramLink';
import { oauth2Link } from '../../../../../lib/oauth/oauth2Link';

export const useProviderHandler = () => {
  const telegramLink = useTelegramLink();

  const handle = (provider: Provider) => {
    if (provider === Provider.EpicGames) oauth2Link('epic-games');
    if (provider === Provider.Telegram) telegramLink();
    if (provider === Provider.X) oauth2Link('x');

    return null;
  };

  return handle;
};
