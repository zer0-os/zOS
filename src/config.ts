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
  defaultApp: process.env.REACT_APP_DEFAULT_APP || Apps.Channels,
  supportedChainId: process.env.REACT_APP_ETH_CHAIN || '1',
  appVersion: process.env.REACT_APP_VERSION,
  cloudinary: {
    cloud_name: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'fact0ry-dev',
    max_file_size: parseInt(process.env.CLOUDINARY_MAX_FILE_SIZE) || 10485760,
  },
  web3AuthenticationMessage: process.env.REACT_APP_WEB3_AUTHENTICATE_MESSAGE,
  sentry: {
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.REACT_APP_VERSION,
  },
  sendBird: {
    appId: process.env.REACT_APP_SENDBIRD_APP_ID,
  },
  inviteCode: {
    dejaVu: process.env.REACT_APP_INVITE_CODE_DEJAVU,
  },
  giphySdkKey: process.env.REACT_APP_GIPHY_SDK_KEY,
  pusher: {
    key: process.env.REACT_APP_PUSHER_KEY,
    cluster: process.env.REACT_APP_PUSHER_CLUSTER,
  },
  inviteUrl: process.env.REACT_APP_MESSENGER_INVITE_PATH,
  assetsPath: process.env.REACT_APP_ASSETS_PATH,
  matrix: {
    userId: process.env.REACT_APP_MATRIX_USER_ID,
    accessToken: process.env.REACT_APP_MATRIX_ACCESS_TOKEN,
  },
  androidStorePath: process.env.REACT_APP_ANDROID_STORE_PATH,
};
