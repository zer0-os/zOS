import { get, post, put } from '../../lib/api/rest';

export async function editUserProfile({
  name,
  primaryZID,
  profileImage,
}: {
  name: string;
  primaryZID: string;
  profileImage?: string;
}) {
  const profileData = {
    firstName: name,
    profileImage,
    primaryZID,
  };
  const response = await put('/api/v2/users/profile').send({ profileData });
  return {
    success: response.status === 200,
  };
}

export async function saveUserMatrixCredentials({
  matrixId,
  matrixAccessToken,
}: {
  matrixId: string;
  matrixAccessToken: string;
}) {
  const response = await post('/matrix/link-zero-user').send({ matrixId, matrixAccessToken });
  return {
    success: response.status === 200,
  };
}

export async function fetchOwnedZIDs() {
  const response = await get('/api/v2/users/zids');
  return response.body;
}
