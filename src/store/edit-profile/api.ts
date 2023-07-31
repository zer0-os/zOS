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
  const response = await patch(`/api/profiles/${profileId}`).send({ profileId, firstName: name, profileImage });
  return {
    success: true,
    response: response.body,
  };
}
