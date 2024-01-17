export enum JoinRoomApiErrorCode {
  ROOM_NOT_FOUND = 'ROOM_NOT_FOUND',
  ACCESS_TOKEN_REQUIRED = 'ACCESS_TOKEN_REQUIRED',
  GENERAL_ERROR = 'GENERAL_ERROR',
}

const ERROR_DIALOG_CONTENT = {
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
};

export function translateJoinRoomApiError(errorCode: JoinRoomApiErrorCode) {
  return ERROR_DIALOG_CONTENT[errorCode];
}
