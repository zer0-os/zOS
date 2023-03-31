import React from 'react';
import Dropzone from 'react-dropzone';
import { dropzoneToMedia, Media } from './utils';
import { IconPaperclip } from '@zero-tech/zui/icons';
import { IconButton } from '../icon-button';

export interface Properties {
  onSelected: (images: Media[]) => void;
  mimeTypes?: any;
  maxSize?: number;
}

export default class Menu extends React.Component<Properties> {
  imagesSelected = (acceptedFiles): void => {
    const newImages: Media[] = dropzoneToMedia(acceptedFiles);

    if (newImages.length) {
      this.props.onSelected(newImages);
    }
  };

  render() {
    return (
      <Dropzone onDrop={this.imagesSelected} accept={this.props.mimeTypes} maxSize={this.props.maxSize}>
        {({ getRootProps, getInputProps, open }) => (
          <div className='image-send'>
            <div {...getRootProps({ className: 'image-send__dropzone' })}>
              <input {...getInputProps()} />
              <IconButton onClick={open} Icon={IconPaperclip} size={16} className='image-send__icon' />
            </div>
          </div>
        )}
      </Dropzone>
    );
  }
}
