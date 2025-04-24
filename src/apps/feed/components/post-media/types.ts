export enum PostMediaType {
  Image = 'image',
  Video = 'video',
}

export interface PostMedia {
  id: string;
  url: string;
  name: string;
  type: PostMediaType;
  width?: number;
  height?: number;
  filecoinCid?: string;
  filecoinStatus?: 'pending' | 'completed' | 'failed';
  createdAt?: string;
  updatedAt?: string;
}
