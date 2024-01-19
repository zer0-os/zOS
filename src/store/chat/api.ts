import { post } from '../../lib/api/rest';

export async function joinRoom(aliasOrId: string): Promise<{ success: boolean; response: any; message: string }> {
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
    throw error;
  }
}
