import React from 'react';

import { CloudinaryProvider } from './provider';

describe('cloudinary/service', () => {
  const cloudinaryProvider = new CloudinaryProvider({ cloud_name: 'fact0ry-dev' });

  describe('getSourceUrl', () => {
    it('it returns url directly if no query string', function () {
      const result = cloudinaryProvider.getSourceUrl('https://donkeys.com/image.jpg');

      expect(result).toEqual('https://donkeys.com/image.jpg');
    });

    it('it returns url directly if query string and no zer0ImageCrop', function () {
      const result = cloudinaryProvider.getSourceUrl('https://donkeys.com/image.jpg?bla=true');

      expect(result).toEqual('https://donkeys.com/image.jpg?bla=true');
    });

    it('it returns url without zer0ImageCrop', function () {
      [
        [
          'https://donkeys.com/image.jpg?__zer0ImageCrop__=something',
          'https://donkeys.com/image.jpg',
        ],
        [
          'https://d.com/i.jpg?__zer0ImageCrop__=something&eggs=cool',
          'https://d.com/i.jpg?eggs=cool',
        ],
        [
          'https://d.com/i.jpg?eggs=awesome&__zer0ImageCrop__=something',
          'https://d.com/i.jpg?eggs=awesome',
        ],
        [
          'https://d.com/i.jpg?eggs=awesome&__zer0ImageCrop__=something&fish=something',
          'https://d.com/i.jpg?eggs=awesome&fish=something',
        ],
      ].forEach((expectation) => {
        expect(cloudinaryProvider.getSourceUrl(expectation[0])).toEqual(expectation[1]);
      });
    });
  });

  describe('getSource', () => {
    const cloudinaryPrefix = 'http://res.cloudinary.com/fact0ry-dev/';

    it('it returns source directly if local', function () {
      const result = cloudinaryProvider.getSource({ src: 'eggs.jpg', local: true, options: {} });

      expect(result).toEqual('eggs.jpg');
    });

    it('it returns url with fetch type if not cloudinary url', function () {
      const result = cloudinaryProvider.getSource({ src: 'https://images.com/myimage.jpg', options: {} });

      expect(result).toEqual(`${cloudinaryPrefix}image/fetch/https://images.com/myimage.jpg`);
    });

    it('it returns cloudinary url if matches cloudinary', function () {
      const result = cloudinaryProvider.getSource({
        src: 'https://res.cloudinary.com/fact0ry-dev/image/upload/v1/eggs.jpg',
        options: {},
      });

      expect(result).toEqual(`${cloudinaryPrefix}image/upload/eggs.jpg`);
    });

    it('it returns cloudinary url with transformation params', function () {
      const result = cloudinaryProvider.getSource({
        src: 'https://res.cloudinary.com/fact0ry-dev/image/upload/v1/eggs.jpg',
        options: { width: 100, height: 200, crop: 'fill' },
      });

      expect(result).toEqual(`${cloudinaryPrefix}image/upload/c_fill,h_200,w_100/eggs.jpg`);
    });

    it('it returns cloudinary url for a different format', function () {
      const result = cloudinaryProvider.getSource({
        src: 'https://res.cloudinary.com/fact0ry-dev/image/upload/v1/eggs.jpg',
        options: { format: 'png' },
      });

      expect(result).toEqual(result, `${cloudinaryPrefix}image/upload/eggs.png`);
    });

    it('it returns cloudinary url for image from video', function () {
      const result = cloudinaryProvider.getSource({
        src: 'https://res.cloudinary.com/fact0ry-dev/video/upload/v1/eggs.mov',
        options: { format: 'jpg', resource_type: 'video' },
      });

      expect(result).toEqual(result, `${cloudinaryPrefix}video/upload/eggs.jpg`);
    });

    it('it returns cloudinary url for image with transformation params for video', function () {
      const result = cloudinaryProvider.getSource({
        src: 'https://res.cloudinary.com/fact0ry-dev/video/upload/v1/eggs.mov',
        options: { width: 100, height: 200, crop: 'fill', format: 'jpg', resource_type: 'video' },
      });

      expect(result).toEqual(`${cloudinaryPrefix}video/upload/c_fill,h_200,w_100/eggs.jpg`);
    });
  });
});
