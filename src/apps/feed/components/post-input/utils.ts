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

export function validateMediaFiles(files: File[]): {
  validFiles: File[];
  rejectedFiles: { file: File; reason: string }[];
} {
  const validFiles: File[] = [];
  const rejectedFiles: { file: File; reason: string }[] = [];
  for (const file of files) {
    const maxSize = getPostMediaMaxFileSize(file.type);
    if (file.size > maxSize) {
      rejectedFiles.push({ file, reason: 'file-too-large' });
    } else {
      validFiles.push(file);
    }
  }
  return { validFiles, rejectedFiles };
}
