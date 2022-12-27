import classNames from 'classnames';
import React from 'react';

import { ImageModel } from './image-model';
import ImageSizes from './image-sizes';

export interface Properties {
  image: ImageModel;
  size?: ImageSizes;
  border?: boolean;
  onRemoveImage?: () => void;
}

export default class ImageCard extends React.Component<Properties, undefined> {
  deleteIcon() {
    const { onRemoveImage } = this.props;

    if (onRemoveImage) {
      return (
        <span
          className='image-card__delete'
          onClick={this.props.onRemoveImage}
        />
      );
    }
  }

  render() {
    const { image, size, border } = this.props;
    const cardClass = classNames(
      'image-card',
      { 'image-card__small': size === 'small' },
      { 'image-card__full-width': size === 'full-width' },
      { 'image-card__regular': size === 'regular' || !size },
      { 'image-card__border': border }
    );

    return (
      <div className={cardClass}>
        <div className='image-card__image'>
          {size !== 'full-width' && (
            <img
              src={image.url}
              title={image.name}
              alt='preview'
            />
          )}
        </div>
        {this.deleteIcon()}
      </div>
    );
  }
}
