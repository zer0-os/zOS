import { config } from '../../config';
import { translateJoinRoomApiError, JoinRoomApiErrorCode } from './utils';

describe(translateJoinRoomApiError, () => {
  it('returns expected message for known error codes', () => {
    const roomNotFoundErrorMessage = translateJoinRoomApiError(JoinRoomApiErrorCode.ROOM_NOT_FOUND);
    expect(roomNotFoundErrorMessage).toEqual({
      header: 'There’s no one here...',
      body: 'This conversation does not exist or you are not a member.',
    });
  });

  it('handles undefined or unhandled error codes', () => {
    const message = translateJoinRoomApiError('SOME_UNDEFINED_ERROR_CODE');
    expect(message).toEqual({
      header: 'Unknown Error',
      body: 'An unexpected error occurred.',
    });
  });

  it('returns expected message with link data for ACCESS_TOKEN_REQUIRED error code', () => {
    const accessTokenRequiredErrorMessage = translateJoinRoomApiError(
      JoinRoomApiErrorCode.ACCESS_TOKEN_REQUIRED,
      'exampleRoom'
    );
    expect(accessTokenRequiredErrorMessage).toEqual({
      header: 'World Members Only',
      body: 'You cannot join this conversation as your wallet does not hold a domain in this world. Buy a domain or switch to a wallet that holds one.',
      linkPath: `${config.znsExplorerUrl}/exampleRoom`,
      linkText: 'Buy A Domain',
    });
  });
});
