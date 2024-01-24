import { config } from '../../config';

export enum JoinRoomApiErrorCode {
  ROOM_NOT_FOUND = 'ROOM_NOT_FOUND',
  ACCESS_TOKEN_REQUIRED = 'ACCESS_TOKEN_REQUIRED',
  GENERAL_ERROR = 'GENERAL_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export const ERROR_DIALOG_CONTENT = {
  [JoinRoomApiErrorCode.ROOM_NOT_FOUND]: {
    header: 'There’s no one here...',
    body: 'This conversation does not exist or you are not a member.',
  },
  [JoinRoomApiErrorCode.ACCESS_TOKEN_REQUIRED]: {
    header: 'World Members Only',
    body: 'You cannot join this conversation as your wallet does not hold a domain in this world. Buy a domain or switch to a wallet that holds one.',
    linkPath: `${config.znsExplorerUrl}/{roomAlias}`,
    linkText: 'Buy A Domain',
  },
  [JoinRoomApiErrorCode.GENERAL_ERROR]: {
    header: 'Error',
    body: 'An error occurred while verifying the conversation.',
  },
  [JoinRoomApiErrorCode.UNKNOWN_ERROR]: {
    header: 'Unknown Error',
    body: 'An unexpected error occurred.',
  },
};

export function translateJoinRoomApiError(errorCode: JoinRoomApiErrorCode | string, roomAlias?: string) {
  const content = ERROR_DIALOG_CONTENT[errorCode] || ERROR_DIALOG_CONTENT[JoinRoomApiErrorCode.UNKNOWN_ERROR];

  if (content.linkPath && content.linkPath.includes('{roomAlias}')) {
    content.linkPath = content.linkPath.replace('{roomAlias}', roomAlias);
  }

  return content;
}
