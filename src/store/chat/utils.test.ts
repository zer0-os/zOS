import { translateJoinRoomApiError, JoinRoomApiErrorCode } from './utils';

describe(translateJoinRoomApiError, () => {
  it('returns expected message for known error codes', () => {
    const roomNotFoundErrorMessage = translateJoinRoomApiError(JoinRoomApiErrorCode.ROOM_NOT_FOUND);
    expect(roomNotFoundErrorMessage).toEqual({
      header: 'Conversation Not Found',
      body: 'This conversation does not exist.',
    });
  });

  it('handles undefined or unhandled error codes', () => {
    const message = translateJoinRoomApiError('SOME_UNDEFINED_ERROR_CODE');
    expect(message).toEqual({
      header: 'Unknown Error',
      body: 'An unexpected error occurred.',
    });
  });
});
