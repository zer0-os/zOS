import { ethers } from 'ethers';
import {
  CONTRACT_ADDRESSES,
  ROOT_REGISTRAR_ABI,
  SUB_REGISTRAR_ABI,
  AccessType,
  PaymentType,
  DistributionConfig,
  PaymentConfig,
} from '../../../abis/contracts';

// Purchase a root (world) ZID
export async function purchaseWorldZid(
  zna: string,
  account: string,
  signer: ethers.Signer,
  metadataId: string
): Promise<string> {
  const rootRegistrar = new ethers.Contract(CONTRACT_ADDRESSES.ROOT_REGISTRAR, ROOT_REGISTRAR_ABI, signer);

  const distributionConfig: DistributionConfig = {
    pricerContract: CONTRACT_ADDRESSES.CURVE_PRICER,
    paymentType: PaymentType.MINT,
    accessType: AccessType.LOCKED,
  };

  const paymentConfig: PaymentConfig = {
    token: CONTRACT_ADDRESSES.ZERO_TOKEN,
    beneficiary: ethers.constants.AddressZero,
  };

  const tx = await rootRegistrar.registerRootDomain(
    zna,
    account,
    `ar://${metadataId}`,
    distributionConfig,
    paymentConfig
  );
  await tx.wait();
  return zna;
}

// Purchase a subdomain ZID
export async function purchaseSubdomainZid(
  zna: string,
  account: string,
  signer: ethers.Signer,
  parentHash: string,
  metadataId: string
): Promise<string> {
  const subRegistrar = new ethers.Contract(CONTRACT_ADDRESSES.SUB_REGISTRAR, SUB_REGISTRAR_ABI, signer);

  const childLabel = zna.split('.')[0];

  const distributionConfig: DistributionConfig = {
    pricerContract: ethers.constants.AddressZero,
    paymentType: PaymentType.MINT,
    accessType: AccessType.LOCKED,
  };

  const paymentConfig: PaymentConfig = {
    token: CONTRACT_ADDRESSES.ZERO_TOKEN,
    beneficiary: ethers.constants.AddressZero,
  };

  const tx = await subRegistrar.registerSubdomain(
    parentHash,
    childLabel,
    account,
    `ar://${metadataId}`,
    distributionConfig,
    paymentConfig
  );
  await tx.wait();
  return zna;
}
