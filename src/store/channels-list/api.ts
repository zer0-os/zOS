import * as Request from 'superagent';
import { Channel } from './../channels/index';
import { get, post } from '../../lib/api/rest';
import { DirectMessage } from './types';

export async function fetchChannels(id: string) {
  try {
    const channels = await get<any>(`/api/networks/${id}/chatChannels`);
    return await channels.body;
  } catch (error: any) {
    console.log('Error occured while fetching chatChannels ', error?.response?.body?.error); // eg. error.code = ENOTFOUND
    return [];
  }
}

export async function fetchConversations(): Promise<Channel[]> {
  try {
    const directMessages = await get<Channel[]>('/directMessages/mine');
    return directMessages.body;
  } catch (error: any) {
    console.log('Error occured while fetching conversations ', error?.response);
    return [];
  }
}

export async function createConversation(
  userIds: string[],
  name: string = '',
  coverUrl = ''
): Promise<DirectMessage[]> {
  const directMessages = await post<Channel[]>('/directMessages').send({ name, userIds, coverUrl });
  return directMessages.body;
}

export async function fetchConversationsWithUsers(userIds: string[]): Promise<any[]> {
  const response = await get<Channel[]>('/conversations', { userIds });
  return response.body;
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
