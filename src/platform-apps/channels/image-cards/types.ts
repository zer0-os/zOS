import { MediaType } from '../../../store/messages';

export interface ImageModel {
  id: string;
  url: string;
  name: string;
  nativeFile?: File;
  type: MediaType;
}

type ImageSizes = 'small' | 'regular' | 'full-width';
export default ImageSizes;
