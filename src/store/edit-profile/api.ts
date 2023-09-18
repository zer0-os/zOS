import { patch, post } from '../../lib/api/rest';

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

export async function saveUserMatrixCredentials({
  matrixId,
  matrixAccessToken,
}: {
  matrixId: string;
  matrixAccessToken: string;
}) {
  console.log(matrixId, matrixAccessToken);
  await post('/matrix/link-zero-user').send({ matrixId, matrixAccessToken });
  return {
    success: true,
  };
}
