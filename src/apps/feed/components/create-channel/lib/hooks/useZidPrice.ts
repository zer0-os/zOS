import { useQuery } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { CURVE_PRICER_ABI, CURVE_PRICER_ADDRESS } from '../../abis/curvePricer';

export function useZidPrice(debouncedZid: string, provider: ethers.providers.Provider | undefined, enabled: boolean) {
  const isValid =
    !!debouncedZid && debouncedZid.length > 0 && /^[a-z0-9-]+$/.test(debouncedZid) && !debouncedZid.includes('.');

  return useQuery({
    queryKey: ['zid-price', debouncedZid],
    enabled: !!provider && isValid && enabled,
    queryFn: async () => {
      const curvePricer = new ethers.Contract(CURVE_PRICER_ADDRESS, CURVE_PRICER_ABI, provider);
      const label = debouncedZid;
      const { price: rawPrice } = await curvePricer.getPriceAndFee(ethers.constants.HashZero, label, false);
      const protocolFee = await curvePricer.getFeeForPrice(ethers.constants.HashZero, rawPrice);
      return {
        total: rawPrice.add(protocolFee),
        priceWei: rawPrice.toString(),
        protocolFee: protocolFee.toString(),
      };
    },
    staleTime: 0,
  });
}
