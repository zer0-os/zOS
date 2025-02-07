import { createThirdwebClient, ThirdwebClient } from 'thirdweb';
import { config } from '../../../config';
import { mainnet, sepolia } from 'thirdweb/chains';

let client;
export function getThirdWebClient(): ThirdwebClient {
  client = client ?? createClient();
  return client;
}

function createClient(): ThirdwebClient {
  return createThirdwebClient({
    clientId: config.thirwebClientId,
  });
}

export function getChain() {
  return config.supportedChainId === '1' ? mainnet : sepolia;
}
