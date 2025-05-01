import { post, get } from '../../lib/api/rest';
import { Response } from 'superagent';

export interface MediaUploadResponse {
  id: string;
  centralizedStorageKey: string;
}

export interface MediaDetailsResponse {
  media: {
    id: string;
    width: number;
    height: number;
    mimeType: string;
    fileSize: number;
  };
  signedUrl: string; // Valid for 60 seconds
}

/**
 * Uploads a media file to the backend
 * @param file The file to upload
 * @returns Promise resolving to MediaUploadResponse
 */
export async function uploadMedia(file: File): Promise<MediaUploadResponse> {
  try {
    const response = await new Promise<Response>((resolve, reject) => {
      post('/api/media')
        .attach('file', file)
        .end((err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        });
    });

    if (!response.ok) {
      throw new Error(response.body.message ?? 'Failed to upload media');
    }

    return response.body;
  } catch (error: any) {
    console.error('Failed to upload media:', error);
    throw new Error(error.response?.body?.message ?? 'Failed to upload media');
  }
}

/**
 * Gets media details and a signed URL for displaying the media
 * @param mediaId The ID of the media to fetch
 * @returns Promise resolving to MediaDetailsResponse
 */
export async function getMediaDetails(mediaId: string): Promise<MediaDetailsResponse> {
  try {
    const response = await get(`/api/media/${mediaId}`);

    if (!response.ok) {
      throw new Error(response.body.message ?? 'Failed to fetch media details');
    }

    return response.body;
  } catch (error: any) {
    console.error('Failed to fetch media details:', error);
    throw new Error(error.response?.body?.message ?? 'Failed to fetch media details');
  }
}
