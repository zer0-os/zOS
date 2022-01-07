import React from 'react';
import { ComponentMeta } from '@storybook/react';

import { WalletSelect } from '../shared-components/wallet-select';

export default {
  title: 'Wallet Select',
  component: WalletSelect,
  args: {
    className: 'storybook-wallet-select',
  },
} as ComponentMeta<typeof WalletSelect>;

export const WithDefaultWallets = (args) => <WalletSelect {...args} />;
