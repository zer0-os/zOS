export interface Item {
  id: string;
  matrixId: string;
  name: string;
  image?: string;
  primaryZID: string;
  primaryWalletAddress: string;
}

export interface Option {
  value: string;
  label: string;
  image?: string;
  subLabel?: string;
}
