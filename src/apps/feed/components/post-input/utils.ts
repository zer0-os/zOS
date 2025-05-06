import { config } from '../../../../config';

export function getPostMediaMaxFileSize(mimeType: string): number {
  if (mimeType === 'image/gif') {
    return config.postMedia.gifMaxFileSize;
  }
  if (mimeType.startsWith('video/')) {
    return config.postMedia.videoMaxFileSize;
  }
  if (mimeType.startsWith('image/')) {
    return config.postMedia.imageMaxFileSize;
  }
  // fallback to smallest
  return config.postMedia.imageMaxFileSize;
}
