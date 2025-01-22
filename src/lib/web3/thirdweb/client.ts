import { createThirdwebClient } from 'thirdweb';
import { config } from '../../../config';
import { mainnet, sepolia } from 'thirdweb/chains';

let client;
export function getThirdWebClient() {
  client = client ?? createClient();
  return client;
}

function createClient() {
  return createThirdwebClient({
    clientId: config.thirwebClientId,
  });
}

export function getChain() {
  return process.env.NODE_ENV === 'development' ? sepolia : mainnet;
}
