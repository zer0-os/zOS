import { config } from '../../../../config';

export function getPostMediaMaxFileSize(mimeType: string, isZeroProSubscriber: boolean = false): number {
  // ZeroPro users get 1GB for all file types
  if (isZeroProSubscriber) {
    return config.postMedia.zeroProUserMaxFileSize;
  }

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

export function validateMediaFiles(
  files: File[],
  isZeroProSubscriber: boolean = false
): {
  validFiles: File[];
  rejectedFiles: { file: File; reason: string }[];
} {
  const validFiles: File[] = [];
  const rejectedFiles: { file: File; reason: string }[] = [];
  for (const file of files) {
    const maxSize = getPostMediaMaxFileSize(file.type, isZeroProSubscriber);
    if (file.size > maxSize) {
      rejectedFiles.push({ file, reason: 'file-too-large' });
    } else {
      validFiles.push(file);
    }
  }
  return { validFiles, rejectedFiles };
}
