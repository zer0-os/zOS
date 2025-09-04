import { useBalancesQuery } from '../queries/useBalancesQuery';
import { useSelector } from 'react-redux';
import { selectedWalletSelector } from '../../../store/wallet/selectors';

export const useUserZeroBalance = () => {
  const selectedWallet = useSelector(selectedWalletSelector);
  const { data, isPending } = useBalancesQuery(selectedWallet.address);
  if (!data || !data.tokens) {
    return {
      balance: 0,
      isLoading: isPending,
    };
  }
  const balance = data.tokens.reduce((acc, token) => {
    if (!token.price) return acc;
    return acc + Number(token.amount ?? 0) * Number(token.price);
  }, 0);

  return {
    balance,
    isLoading: isPending,
  };
};
