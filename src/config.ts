import { Apps } from './lib/apps';

export const config = {
  INFURA_URL: process.env.REACT_APP_INFURA_URL,
  ZERO_API_URL: process.env.REACT_APP_ZERO_API_URL,
  infuraId: process.env.REACT_APP_INFURA_ID,
  rootDomainId: process.env.REACT_APP_ROOT_DOMAIN_ID,
  defaultZnsRoute: process.env.REACT_APP_DEFAULT_ZNS_DOMAIN || '',
  ipfsBaseUrl: process.env.REACT_APP_IPFS_BASE_URL,
  fortmaticApiKey: process.env.REACT_APP_FORTMATIC_API_KEY,
  portisDAppId: process.env.REACT_APP_PORTIS_DAPP_ID,
  defaultApp: process.env.REACT_APP_DEFAULT_APP || Apps.Feed,
  supportedChainId: process.env.REACT_APP_ETH_CHAIN || '1',
  appVersion: process.env.REACT_APP_VERSION,
  cloudinary: {
    cloud_name: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'fact0ry-dev',
    max_file_size: parseInt(process.env.CLOUDINARY_MAX_FILE_SIZE) || 10485760,
  },
};
