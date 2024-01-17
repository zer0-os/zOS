import { translateJoinRoomApiError, JoinRoomApiErrorCode } from './utils';

describe(translateJoinRoomApiError, () => {
  it(JoinRoomApiErrorCode.ROOM_NOT_FOUND, () => {
    const message = translateJoinRoomApiError(JoinRoomApiErrorCode.ROOM_NOT_FOUND);
    expect(message).toEqual({ header: 'Conversation Not Found', body: 'This conversation does not exist.' });
  });

  it(JoinRoomApiErrorCode.ACCESS_TOKEN_REQUIRED, () => {
    const message = translateJoinRoomApiError(JoinRoomApiErrorCode.ACCESS_TOKEN_REQUIRED);
    expect(message).toEqual({
      header: 'World Members Only',
      body: 'You cannot join this conversation as you do not own a domain in this World.',
    });
  });

  it(JoinRoomApiErrorCode.GENERAL_ERROR, () => {
    const message = translateJoinRoomApiError(JoinRoomApiErrorCode.GENERAL_ERROR);
    expect(message).toEqual({
      header: 'Error',
      body: 'An error occurred while verifying the conversation.',
    });
  });
});
