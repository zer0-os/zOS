import { User } from '../../store/channels';
import { MediaType } from '../../store/messages';

export interface Media {
  id: string;
  url: string;
  name: string;
  type: MediaType;
  nativeFile?: File;
  mediaType: MediaType;
  giphy?: any;
}
export interface UserForMention {
  display: string;
  id: User['userId'];
  profileImage: User['profileImage'];
}

export interface Image {
  id: string;
  url: string;
  name: string;
  nativeFile?: File;
}

export const dropzoneToMedia = (files: any[]) => {
  const media: Media[] = files.map((file) => {
    let mediaType = MediaType.Image;
    const fileType = file.type || '';
    if (fileType.startsWith('video/')) {
      mediaType = MediaType.Video;
    }
    if (fileType.startsWith('audio/')) {
      mediaType = MediaType.Audio;
    }
    if (fileType.startsWith('text/') || fileType.startsWith('application/')) {
      mediaType = MediaType.File;
    }

    return {
      id: Date.now().toString(),
      url: URL.createObjectURL(file),
      name: file.name,
      nativeFile: file,
      type: mediaType,
      mediaType,
    };
  });

  return media;
};

export async function addImagePreview(files: any[]) {
  const images = await Promise.all(files.map(getImagePreview));

  return images;
}

export async function getImagePreview(file: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      file.preview = e.target.result as string;
      resolve(file);
    };

    reader.onerror = function (e) {
      reject(e);
    };

    reader.readAsDataURL(file);
  });
}

export function windowClipboard() {
  return {
    addPasteListener: (handler) => {
      window.addEventListener('paste', handler);
    },
    removePasteListener: (handler) => {
      window.removeEventListener('paste', handler);
    },
  };
}

export function bytesToMB(bytes) {
  if (typeof bytes !== 'number') {
    return 'Invalid input';
  }

  const megabytes = bytes / (1024 * 1024);
  const formattedMegabytes = megabytes.toFixed(2).replace(/\.00$/, '');
  return `${formattedMegabytes} MB`;
}
