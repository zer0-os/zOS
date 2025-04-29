export enum PostMediaType {
  Image = 'image',
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
