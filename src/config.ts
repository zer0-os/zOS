export const config = {
  INFURA_URL: import.meta.env.VITE_INFURA_URL,
  ZERO_API_URL: import.meta.env.VITE_ZERO_API_URL,
  supportedChainId: import.meta.env.VITE_ETH_CHAIN || '1',
  appVersion: import.meta.env.VITE_VERSION,
  cloudinary: {
    cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'fact0ry-dev',
    max_file_size: parseInt(import.meta.env.CLOUDINARY_MAX_FILE_SIZE) || 10485760,
  },
  web3AuthenticationMessage: import.meta.env.VITE_WEB3_AUTHENTICATE_MESSAGE,
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.NODE_ENV,
    release: import.meta.env.VITE_VERSION,
  },
  giphySdkKey: import.meta.env.VITE_GIPHY_SDK_KEY,
  inviteUrl: import.meta.env.VITE_MESSENGER_INVITE_PATH,
  videoAssetsPath: import.meta.env.VITE_VIDEO_ASSETS_PATH,
  imageAssetsPath: import.meta.env.VITE_IMAGE_ASSETS_PATH,
  matrix: {
    homeServerUrl: import.meta.env.VITE_MATRIX_HOME_SERVER_URL,
  },
  androidStorePath: import.meta.env.VITE_ANDROID_STORE_PATH,
  znsExplorerUrl: import.meta.env.VITE_ZNS_EXPLORER_URL,
};
