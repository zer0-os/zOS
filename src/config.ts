
export const config = {
  INFURA_URL: process.env.REACT_APP_INFURA_URL,
  rootDomainId: process.env.REACT_APP_ROOT_DOMAIN_ID,
  defaultZnsRoute: (process.env.REACT_APP_DEFAULT_ZNS_DOMAIN || ''),
  ipfsBaseUrl: process.env.REACT_APP_IPFS_BASE_URL,
  fortmaticApiKey: process.env.REACT_APP_FORTMATIC_API_KEY,
};
