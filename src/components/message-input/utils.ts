import { User } from '../../store/channels';
import * as uuid from 'node-uuid';

export interface Media {
  id: string;
  url: string;
  name: string;
  nativeFile?: File;
  mediaType?: 'image' | 'video' | 'audio';
  giphy?: any;
}
export interface UserForMention {
  display: string;
  id: User['id'];
}

export interface Image {
  id: string;
  url: string;
  name: string;
  nativeFile?: File;
  //giphy?: IGif;
}

export const dropzoneToMedia = (files: any[]) => {
  const images: Image[] = files.map((file) => {
    let mediaType = 'image';
    if ((file.type || '').startsWith('video/')) {
      mediaType = 'video';
    }
    if ((file.type || '').startsWith('audio/')) {
      mediaType = 'audio';
    }

    return { id: uuid.v4(), url: URL.createObjectURL(file), name: file.name, nativeFile: file, mediaType };
  });

  return images;
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

export const getUsersForMentions = (search: string, users: User[]): UserForMention[] => {
  if (users && users.length) {
    return users
      .map((user) => ({
        display: [
          user.firstName,
          user.lastName,
        ].join(' '),
        id: user.id,
      }))
      .filter((user) => user.display.toLowerCase().includes(search.toLowerCase()));
  }
  return [];
};
