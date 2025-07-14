import { useMutation } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { generateMetadata } from './metadata';
import { checkAndApproveToken } from './tokenApproval';
import { purchaseWorldZid, purchaseSubdomainZid } from './purchaseZid';
import { getParentDomainHash } from './getParentDomainHash';
import { CONTRACT_ADDRESSES } from '../abis/contracts';

// Define CURVE_PRICER_ABI here if not exported from contracts
const CURVE_PRICER_ABI = [
  'function getPriceAndFee(bytes32 parentHash, string label, bool isSubdomain) view returns (tuple(uint256 price, uint256 fee))',
  'function getFeeForPrice(bytes32 parentHash, uint256 price) view returns (uint256)',
];

interface PurchaseZidParams {
  zna: string;
  account: string;
  signer: ethers.Signer;
  provider: ethers.providers.Provider;
}

export function usePurchaseZid() {
  return useMutation({
    mutationFn: async ({ zna, account, signer, provider }: PurchaseZidParams) => {
      const isWorld = !zna.includes('.');

      // 1. Generate metadata
      const metadataId = await generateMetadata(zna, isWorld);

      // 2. Get price (direct contract call, not via React Query)
      let price;
      if (isWorld) {
        const curvePricer = new ethers.Contract(CONTRACT_ADDRESSES.CURVE_PRICER, CURVE_PRICER_ABI, provider);
        const label = zna;
        const { price: rawPrice } = await curvePricer.getPriceAndFee(ethers.constants.HashZero, label, false);
        const protocolFee = await curvePricer.getFeeForPrice(ethers.constants.HashZero, rawPrice);
        price = {
          total: rawPrice.add(protocolFee),
          priceWei: rawPrice.toString(),
          protocolFee: protocolFee.toString(),
        };
      } else {
        price = { total: ethers.BigNumber.from(0) };
      }

      // 3. Check/approve token
      await checkAndApproveToken(price, account, signer);

      // 4. Purchase
      if (isWorld) {
        return await purchaseWorldZid(zna, account, signer, metadataId);
      } else {
        // Get parent hash for subdomain
        const parentZna = zna.split('.').slice(1).join('.');
        const parentHash = await getParentDomainHash(parentZna);
        return await purchaseSubdomainZid(zna, account, signer, parentHash, metadataId);
      }
    },
  });
}
