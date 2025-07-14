export const CURVE_PRICER_ABI = [
  'function getPriceAndFee(bytes32 parentHash, string label, bool includeFee) external view returns (uint256 price, uint256 fee)',
  'function getFeeForPrice(bytes32 parentHash, uint256 price) external view returns (uint256)',
];

export const CURVE_PRICER_ADDRESS = '0xA5E9a65bBc880BFB227561CBD644925918EF83a9';
