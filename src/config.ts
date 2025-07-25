export const config = {
  INFURA_URL: process.env.REACT_APP_INFURA_URL,
  ZERO_API_URL: process.env.REACT_APP_ZERO_API_URL,
  WALLET_CONNECT_PROJECT_ID: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID,
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
  appleAppStorePath: process.env.REACT_APP_APPLE_APP_STORE_PATH,
  googlePlayStorePath: process.env.REACT_APP_GOOGLE_PLAY_STORE_PATH,
  webAppDownloadPath: process.env.REACT_APP_WEB_APP_DOWNLOAD_PATH,
  telegramBotUserId: process.env.REACT_APP_TELEGRAM_BOT_USER_ID,
  thirwebClientId: process.env.REACT_APP_THIRDWEB_CLIENT_ID,
  matrixHomeServerName: process.env.REACT_APP_MATRIX_HOME_SERVER_NAME,
  messageFileSize: { basicUser: 10485760, zeroProUser: 1073741824 },
  postMedia: {
    imageMaxFileSize: parseInt(process.env.REACT_APP_POST_IMAGE_MAX_FILE_SIZE) || 10485760,
    gifMaxFileSize: parseInt(process.env.REACT_APP_POST_GIF_MAX_FILE_SIZE) || 15728640,
    videoMaxFileSize: parseInt(process.env.REACT_APP_POST_VIDEO_MAX_FILE_SIZE) || 104857600,
    zeroProUserMaxFileSize: 1073741824,
  },
  stripePublishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
  INFURA_URLS: {
    1: process.env.REACT_APP_ETH_INFURA_URL,
    137: process.env.REACT_APP_POLY_INFURA_URL,
    43114: process.env.REACT_APP_AVAX_INFURA_URL, // Avalanche mainnet
    43113: process.env.REACT_APP_AVAX_FUJI_INFURA_URL, // Avalanche Fuji testnet
  },
  znsMetadataApiUrl: process.env.REACT_APP_ZNS_METADATA_API_URL,
};
