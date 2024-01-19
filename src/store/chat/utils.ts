export enum JoinRoomApiErrorCode {
  ROOM_NOT_FOUND = 'ROOM_NOT_FOUND',
  ACCESS_TOKEN_REQUIRED = 'ACCESS_TOKEN_REQUIRED',
  GENERAL_ERROR = 'GENERAL_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export const ERROR_DIALOG_CONTENT = {
  [JoinRoomApiErrorCode.ROOM_NOT_FOUND]: {
    header: 'Conversation Not Found',
    body: 'This conversation does not exist.',
  },
  [JoinRoomApiErrorCode.ACCESS_TOKEN_REQUIRED]: {
    header: 'World Members Only',
    body: 'You cannot join this conversation as you do not own a domain in this World.',
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

export function translateJoinRoomApiError(errorCode: JoinRoomApiErrorCode | string) {
  return ERROR_DIALOG_CONTENT[errorCode] || ERROR_DIALOG_CONTENT[JoinRoomApiErrorCode.UNKNOWN_ERROR];
}
