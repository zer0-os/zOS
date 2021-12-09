import { configuration } from '@zero-tech/zns-sdk';

import { Chains } from '../';

function extractChainFromProvider(provider) {
  switch (provider.network.name) {
    case 'kovan':
      return Chains.Kovan;
  }
}

export function getForProvider(provider: any) {
  switch (extractChainFromProvider(provider)) {
    case Chains.Kovan:
      return configuration.kovanConfiguration(provider);
  }
}
