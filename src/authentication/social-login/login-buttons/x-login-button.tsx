import { useOAuthFlow } from '../hooks/useOAuthFlow';
import { LoginButton } from './login-button';

export const XLoginButton = () => {
  const initiateOAuthFlow = useOAuthFlow();

  const handleClick = () => {
    initiateOAuthFlow('x');
  };

  return <LoginButton onClick={handleClick} imageUrl='/providers/x.png' alt='X' />;
};
