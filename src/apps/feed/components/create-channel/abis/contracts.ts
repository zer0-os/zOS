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

// Contract addresses (zchain)
export const CONTRACT_ADDRESSES = {
  ROOT_REGISTRAR: '0x9C384560Ac294083cdA862979eFe3dABF0eF605a',
  SUB_REGISTRAR: '0x4E5A5c44A2b3AD02580128582d1F5Ff36482E550',
  ZERO_TOKEN: '0x6ce4a22AA99F9ae41D27E1eC3f40c32b8D0C3113',
  CURVE_PRICER: '0x5Ee4302CBED516B8BB34170Be3Ca9aDA82400448',
  TREASURY: '0x2607F4dE725F0bA64850a1e47A93A05f29Bd8796',
};

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
