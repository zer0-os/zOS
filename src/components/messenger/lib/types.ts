import { Wallet } from '../../../store/authentication/types';

export interface Item {
  id: string;
  name: string;
  image?: string;
  primaryZID?: string;
  wallets?: Wallet[];
}

export interface Option {
  value: string;
  label: string;
  image?: string;
  subLabel?: string;
}
