import React from 'react';
import { ComponentMeta } from '@storybook/react';

import { EthAddress } from '../shared-components/eth-address';

export default {
  title: 'EthAddress',
  component: EthAddress,
  args: {
    className: 'storybook-eth-address',
  },
} as ComponentMeta<typeof EthAddress>;

export const WithAddress = (args) => <EthAddress address='0x000000000000000000000000000000000000000A' {...args} />;
