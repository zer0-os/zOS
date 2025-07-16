import { useOAuthFlow } from '../hooks/useOAuthFlow';
import { LoginButton } from './login-button';

export const EpicGamesLoginButton = () => {
  const initiateOAuthFlow = useOAuthFlow();

  const handleClick = () => {
    initiateOAuthFlow('epic-games');
  };

  return <LoginButton onClick={handleClick} imageUrl='/providers/epic-games.png' alt='Epic Games' />;
};
