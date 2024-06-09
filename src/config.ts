export const config = {
  INFURA_URL: import.meta.env.REACT_APP_INFURA_URL,
  ZERO_API_URL: import.meta.env.REACT_APP_ZERO_API_URL,
  supportedChainId: import.meta.env.REACT_APP_ETH_CHAIN || '1',
  appVersion: import.meta.env.REACT_APP_VERSION,
  cloudinary: {
    cloud_name: import.meta.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'fact0ry-dev',
    max_file_size: parseInt(import.meta.env.CLOUDINARY_MAX_FILE_SIZE) || 10485760,
  },
  web3AuthenticationMessage: import.meta.env.REACT_APP_WEB3_AUTHENTICATE_MESSAGE,
  sentry: {
    dsn: import.meta.env.REACT_APP_SENTRY_DSN,
    environment: import.meta.env.NODE_ENV,
    release: import.meta.env.REACT_APP_VERSION,
  },
  giphySdkKey: import.meta.env.REACT_APP_GIPHY_SDK_KEY,
  inviteUrl: import.meta.env.REACT_APP_MESSENGER_INVITE_PATH,
  videoAssetsPath: import.meta.env.REACT_APP_VIDEO_ASSETS_PATH,
  imageAssetsPath: import.meta.env.REACT_APP_IMAGE_ASSETS_PATH,
  matrix: {
    homeServerUrl: import.meta.env.REACT_APP_MATRIX_HOME_SERVER_URL,
  },
  androidStorePath: import.meta.env.REACT_APP_ANDROID_STORE_PATH,
  znsExplorerUrl: import.meta.env.REACT_APP_ZNS_EXPLORER_URL,
};
