import * as Request from 'superagent';
import { Channel } from './../channels/index';
import { get, post } from '../../lib/api/rest';
import { DirectMessage } from './types';

export async function fetchChannels(id: string) {
  try {
    const channels = await get<any>(`/api/networks/${id}/chatChannels`);
    return await channels.body;
  } catch (error: any) {
    console.log('Error occured while fetching chatChannels ', error?.response ?? error); // eg. error.code = ENOTFOUND
  }
}

export async function createConversation(
  userIds: string[],
  name: string = '',
  coverUrl = '',
  optimisticId: string
): Promise<DirectMessage> {
  const directMessages = await post<Channel[]>('/directMessages').send({
    name,
    userIds,
    coverUrl,
    optimisticId,
  });
  return directMessages.body;
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
