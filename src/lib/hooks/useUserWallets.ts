import { useSelector } from 'react-redux';

import { userWalletsSelector } from '../../store/authentication/selectors';

/**
 * Gets a list of wallets owned by the user.
 * @returns list of wallets owned by the user
 */
export const useUserWallets = () => {
  const wallets = useSelector(userWalletsSelector);

  return {
    wallets,
  };
};
