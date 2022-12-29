export interface ImageModel {
  id: string;
  url: string;
  name: string;
  nativeFile?: File;
}

type ImageSizes = 'small' | 'regular' | 'full-width';
export default ImageSizes;
