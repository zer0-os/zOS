export const config = {
  INFURA_URL: process.env.REACT_APP_INFURA_URL,
  ZERO_API_URL: process.env.REACT_APP_ZERO_API_URL,
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
  giphySdkKey: process.env.REACT_APP_GIPHY_SDK_KEY,
  inviteUrl: process.env.REACT_APP_MESSENGER_INVITE_PATH,
  videoAssetsPath: process.env.REACT_APP_VIDEO_ASSETS_PATH,
  imageAssetsPath: process.env.REACT_APP_IMAGE_ASSETS_PATH,
  matrix: {
    homeServerUrl: process.env.REACT_APP_MATRIX_HOME_SERVER_URL,
  },
  androidStorePath: process.env.REACT_APP_ANDROID_STORE_PATH,
  znsExplorerUrl: process.env.REACT_APP_ZNS_EXPLORER_URL,
};
