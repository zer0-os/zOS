export interface LinkPreview {
  url: string;
  type: LinkPreviewType;
  title: string;
  description: string;
  providerName?: string;
  authorName?: string;
  authorUrl?: string;
  html?: string;
  thumbnail?: {
    url: string;
    width: number;
    height: number;
  };
}

export enum LinkPreviewType {
  Photo = 'photo',
  Video = 'video',
  Link = 'link',
  Rich = 'rich',
}
