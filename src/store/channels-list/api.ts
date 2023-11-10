import * as Request from 'superagent';
import { get } from '../../lib/api/rest';

export async function fetchChannels(id: string) {
  try {
    const channels = await get<any>(`/api/networks/${id}/chatChannels`);
    return await channels.body;
  } catch (error: any) {
    console.log('Error occured while fetching chatChannels ', error?.response ?? error); // eg. error.code = ENOTFOUND
  }
}

interface ImageApiUploadResponse {
  apiUrl: string;
  query: string;
}

interface FileResult {
  url: string;
}

export async function uploadImage(file: File): Promise<FileResult> {
  const response = await get<ImageApiUploadResponse>('/upload/info');
  const uploadInfo = response.body;

  const uploadResponse = await Request.post(uploadInfo.apiUrl).attach('file', file).query(uploadInfo.query);

  if (uploadResponse.status !== 200) {
    throw new Error(
      `Error uploading file [${uploadResponse.status}]: ${uploadResponse.data.error.message || 'No reason given'}`
    );
  }

  const { body } = uploadResponse;

  const url: string = body.secure_url || body.url;
  return { url };
}

export async function getZEROUsers(matrixIds: string[]) {
  return await get('/matrix/users/zero', { matrixIds })
    .catch((_error) => null)
    .then((response) => {
      if (!response?.body) {
        return [];
      }

      // The api endpoint does not return the standard user object, so we need to map it
      return response.body.map((u) => ({ ...u, userId: u.id }));
    });
}
