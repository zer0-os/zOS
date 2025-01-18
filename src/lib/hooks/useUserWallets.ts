import { useSelector } from 'react-redux';

import { RootState } from '../../store/reducer';

/**
 * Gets a list of wallets owned by the user.
 * @returns list of wallets owned by the user
 */
export const useUserWallets = () => {
  const wallets = useSelector((state: RootState) => state.authentication.user?.data?.wallets);

  return {
    wallets,
  };
};
