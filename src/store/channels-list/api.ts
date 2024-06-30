import * as Request from 'superagent';
import { get, post } from '../../lib/api/rest';
import { User } from '../channels';
import { rawUserToDomainUser } from './utils';

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

export async function getZEROUsers(matrixIds: string[]): Promise<User[]> {
  try {
    const response = await post('/matrix/users/zero').send({
      matrixIds,
    });

    if (!response?.body) {
      return [];
    }

    return response.body.map(rawUserToDomainUser);
  } catch (error) {
    return [];
  }
}
