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
    linkPath: `${config.znsExplorerUrl}/{domain}`,
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

export function translateJoinRoomApiError(errorCode: JoinRoomApiErrorCode | string, domain?: string) {
  const content = ERROR_DIALOG_CONTENT[errorCode] || ERROR_DIALOG_CONTENT[JoinRoomApiErrorCode.UNKNOWN_ERROR];

  if (errorCode === JoinRoomApiErrorCode.ACCESS_TOKEN_REQUIRED && content.linkPath?.includes('{domain}')) {
    content.linkPath = content.linkPath.replace('{domain}', domain);
  }

  return content;
}

// conversation can be referenced by an id or an alias
export function isAlias(id: string) {
  return !id.startsWith('!');
}

// alias is prefixed with a #, and we don't want to store that in the URL,
// but we do want to store it in the state
export function parseAlias(id: string) {
  if (isAlias(id)) {
    return '#' + id;
  }

  return id;
}

export function extractDomainFromAlias(alias: string): string {
  if (isAlias(alias)) {
    return alias.substring(1).split(':')[0];
  }

  return '';
}
