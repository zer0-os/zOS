import classNames from 'classnames';
import React from 'react';

import ImageSizes, { ImageModel } from './types';
import { IconTrash4 } from '@zero-tech/zui/icons';
import { MediaType } from '../../../store/messages';

export interface Properties {
  border?: boolean;
  className?: string;
  image: ImageModel;
  onRemoveImage?: () => void;
  showName?: boolean;
  size?: ImageSizes;
}

export default class ImageCard extends React.Component<Properties, undefined> {
  deleteIcon() {
    const { onRemoveImage } = this.props;

    if (onRemoveImage) {
      return (
        <button className='image-card__delete button-reset' onClick={this.props.onRemoveImage}>
          <IconTrash4 isFilled={true} size={20} />
        </button>
      );
    }
  }

  render() {
    const { image, size, border, showName = true } = this.props;
    const cardClass = classNames(
      'image-card',
      { 'image-card__small': size === 'small' },
      { 'image-card__full-width': size === 'full-width' },
      { 'image-card__regular': size === 'regular' || !size },
      { 'image-card__border': border },
      this.props.className
    );

    return (
      <div className={cardClass}>
        <div className={'image-card__image-wrap'}>
          <div className='image-card__image'>
            {size !== 'full-width' &&
              (image.type === MediaType.Image ? (
                <img src={image.url} title={image.name} alt='preview' />
              ) : (
                <video src={image.url} title={image.name} autoPlay={true} muted={true} />
              ))}
          </div>
          {this.deleteIcon()}
        </div>
        {showName && <div className='image-card__name'>{image.name}</div>}
      </div>
    );
  }
}
