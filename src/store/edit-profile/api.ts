import { patch } from '../../lib/api/rest';

export async function editUserProfile({
  profileId,
  name,
  profileImage,
}: {
  profileId: string;
  name: string;
  profileImage?: string;
}) {
  try {
    const response = await patch(`/api/profiles/${profileId}`).send({ profileId, firstName: name, profileImage });
    return {
      success: true,
      response: response.body,
    };
  } catch (error: any) {
    if (error?.response?.status === 400) {
      return {
        success: false,
        response: error.response.body.code,
      };
    }
    throw error;
  }
}
