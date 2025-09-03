import { useSelector } from 'react-redux';
import { usePool } from '../lib/usePool';
import { useTokenPrice } from './useTokenPrice';
import { ethers } from 'ethers';
import { meowInUSDSelector } from '../../../store/rewards/selectors';
import { MEOW_TOKEN_ADDRESS, MEOW_ZEPHYR_TOKEN_ADDRESS } from '../../wallet/constants';

export const useStakingTVL = (poolAddress: string, chainId: number) => {
  const { stakingTokenInfo, totalStaked } = usePool(poolAddress, chainId);
  const { data: stakingTokenPrice, isPending } = useTokenPrice(stakingTokenInfo?.address, chainId);
  const meowPrice = useSelector(meowInUSDSelector);

  let loading = isPending;
  let price = stakingTokenPrice ?? 0;
  if (stakingTokenInfo?.address === MEOW_TOKEN_ADDRESS || stakingTokenInfo?.address === MEOW_ZEPHYR_TOKEN_ADDRESS) {
    price = meowPrice;
    loading = false;
  }

  const totalStakedFormatted = totalStaked ? parseFloat(ethers.utils.formatUnits(totalStaked, 18)) : 0;
  return {
    tvl: totalStakedFormatted * price,
    stakingTokenPrice: price,
    loading,
  };
};
