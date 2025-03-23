export interface ImageOptions {
  width?: number;
  height?: number;
  crop?: 'thumb' | 'fill' | 'lfill' | 'fit';
  gravity?: 'auto' | 'face:auto' | 'faces:auto';
  radius?: 'max';
  format?: 'png' | 'jpg'; // this option only works if you don't provide an extension with the filename
  fetch_format?: 'png' | 'jpg'; // force the format even if a different format specified in filename
  background?: 'black' | 'transparent';
  transformation?: any[];
  resource_type?: 'image' | 'video';
}
