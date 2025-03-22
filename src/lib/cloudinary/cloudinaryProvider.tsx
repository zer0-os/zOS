import { Cloudinary, Configuration } from 'cloudinary-core';
import { ImageOptions } from './types/image';

interface SourceOptions {
  src: string;
  local?: boolean;
  options: ImageOptions;
}

interface Media {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  type: 'image' | 'video' | 'file' | 'audio';
}

export class CloudinaryProvider {
  cloudinary: Cloudinary;
  options: Configuration.Options;

  constructor(options = {}) {
    this.options = options;
    this.cloudinary = new Cloudinary({ ...options });
  }

  getSourceUrl(source: string) {
    if (source && source.includes('__zer0ImageCrop__=')) {
      try {
        let nonParams, queryParams, _ignore;
        [
          _ignore,
          nonParams,
          queryParams,
        ] = source.match(/(.*)\?(.*)/);

        queryParams = new URLSearchParams(queryParams);
        queryParams.delete('__zer0ImageCrop__');

        if (queryParams && [...queryParams.keys()].length !== 0) {
          return [
            nonParams,
            '?',
            queryParams.toString(),
          ].join('');
        }

        return nonParams;
      } catch (error) {
        console.log('error parsing source', error, source);
      }
    }

    return source;
  }

  getSource({ src, local = false, options = {} }: SourceOptions) {
    let source = src;

    if (!local) {
      if (source.indexOf('/assets/') >= 0 || source.indexOf('data:image') === 0) {
        return source;
      }

      source = this.getSourceUrl(source);

      const cloudinaryRegex = new RegExp(
        `https://res.cloudinary.com/${this.options.cloud_name}/(image|video)/upload/v[0-9]+/`,
        'i'
      );
      source = source.replace(cloudinaryRegex, '');
      const isFetchType = source.indexOf('://') > 0;
      const cdnOptions = {
        ...options,
        type: isFetchType ? 'fetch' : undefined,
      };

      if (!isFetchType && cdnOptions.format && cdnOptions.resource_type === 'video') {
        source = source.substr(0, source.lastIndexOf('.')) + `.${cdnOptions.format}`;
      }

      source = this.cloudinary.url(source, cdnOptions);
    }

    return source;
  }

  fitWithinBox(media: Media, maxWidth: number = 2000, maxHeight: number = 1500): ImageOptions {
    const imageOptions = {} as ImageOptions;

    if (media.height >= media.width) {
      if (media.height > maxHeight) {
        imageOptions.height = maxHeight;
        imageOptions.crop = 'fill';
      }
    } else {
      if (media.width > maxWidth) {
        imageOptions.width = maxWidth;
        imageOptions.crop = 'fill';
      }
    }

    return imageOptions;
  }
}
