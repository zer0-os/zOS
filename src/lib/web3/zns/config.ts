import { configuration } from '@zero-tech/zns-sdk';

import { Chains } from '../';

async function extractChainFromProvider(provider) {
  // this also sets the network on the underlying object,
  // which is the main reason we're doing this.
  // the zns config generation has a deep dependency on
  // that property being loaded. until we can change that
  // to pure config this will need to be async.
  const network = await provider.getNetwork();

  switch (network.name) {
    case 'kovan':
      return Chains.Kovan;
  }
}

export async function getForProvider(provider: any) {
  switch (await extractChainFromProvider(provider)) {
    case Chains.Kovan:
      return configuration.kovanConfiguration(provider);
  }
}
