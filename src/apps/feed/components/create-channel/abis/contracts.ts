// Contract ABIs
export const ROOT_REGISTRAR_ABI = [
  'function registerRootDomain(string name, address domainAddress, string tokenURI, tuple(address pricerContract, uint8 paymentType, uint8 accessType) distributionConfig, tuple(address token, address beneficiary) paymentConfig) external returns (bytes32)',
];

export const SUB_REGISTRAR_ABI = [
  'function registerSubdomain(bytes32 parentHash, string label, address domainAddress, string tokenURI, tuple(address pricerContract, uint8 paymentType, uint8 accessType) distrConfig, tuple(address token, address beneficiary) paymentConfig) external returns (bytes32)',
];

export const ZERO_TOKEN_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
];

// Contract addresses (mainnet)
export const CONTRACT_ADDRESSES = {
  ROOT_REGISTRAR: '0x67611d0445f26a635a7D1cb87a3A687B95Ce4a05',
  SUB_REGISTRAR: '0x9071cf975E24dB9D619f1DF83B5B3EFA2C4BD09e',
  ZERO_TOKEN: '0x0eC78ED49C2D27b315D462d43B5BAB94d2C79bf8',
  CURVE_PRICER: '0xA5E9a65bBc880BFB227561CBD644925918EF83a9',
};

// Types & Enums
export enum AccessType {
  LOCKED = 0,
  OPEN = 1,
  MINTLIST = 2,
}

export enum PaymentType {
  MINT = 0,
  STAKE = 1,
}

export interface DistributionConfig {
  pricerContract: string;
  paymentType: PaymentType;
  accessType: AccessType;
}

export interface PaymentConfig {
  token: string;
  beneficiary: string;
}
