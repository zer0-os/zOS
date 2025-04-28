import React from 'react';
import ImageCard from './image-card';
import ImageSizes, { ImageModel } from './types';

import './styles.scss';

export interface Properties {
  images: ImageModel[];
  size?: ImageSizes;
  border?: boolean;
  onRemoveImage?: (ImageModel) => void;
}

export default class ImageCards extends React.Component<Properties, undefined> {
  imageRemoved = (image) => {
    const { onRemoveImage } = this.props;

    if (onRemoveImage) {
      return () => {
        onRemoveImage(image);
      };
    }
  };

  render() {
    const { images, size, border } = this.props;

    if (images.length === 0) {
      return <span />;
    }

    const imageCards = images.map((image) => {
      return (
        <ImageCard border={border} key={image.id} image={image} size={size} onRemoveImage={this.imageRemoved(image)} />
      );
    });

    return <div className='image-cards__container'>{imageCards}</div>;
  }
}
