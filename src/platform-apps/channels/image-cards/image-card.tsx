import classNames from 'classnames';
import React from 'react';

import ImageSizes, { ImageModel } from './types';
import { IconTrash4 } from '@zero-tech/zui/icons';

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
        <button className='image-card__delete button-reset' onClick={this.props.onRemoveImage}>
          <IconTrash4 size={20} />
        </button>
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
        <div className={'image-card__image-wrap'}>
          <div className='image-card__image'>
            {size !== 'full-width' && <img src={image.url} title={image.name} alt='preview' />}
          </div>
          {this.deleteIcon()}
        </div>
        <div className='image-card__name'>{image.name}</div>
      </div>
    );
  }
}
