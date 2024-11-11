import { post } from '../../lib/api/rest';
import { JoinRoomApiErrorCode } from './utils';
import { featureFlags } from '../../lib/feature-flags';

export async function joinRoom(aliasOrId: string): Promise<{ success: boolean; response: any; message: string }> {
  if (featureFlags.enableTokenGatedChat) {
    try {
      const response = await post('/matrix/room/join').send({
        roomAliasORId: aliasOrId,
      });
      return {
        success: true,
        response: response.body,
        message: 'OK',
      };
    } catch (error: any) {
      if (error?.response?.status === 400) {
        return {
          success: false,
          response: error.response.body.code,
          message: error.response.body.message,
        };
      }
      return {
        success: false,
        response: JoinRoomApiErrorCode.UNKNOWN_ERROR,
        message: '',
      };
    }
  }
  return {
    success: false,
    response: JoinRoomApiErrorCode.ROOM_NOT_FOUND,
    message: '',
  };
}
