import React from 'react';
import Dropzone from 'react-dropzone';
import { dropzoneToMedia, formatFileSize, Media } from '../utils';
import { IconPlus } from '@zero-tech/zui/icons';
import { IconButton, ToastNotification } from '@zero-tech/zui/components';

import './styles.scss';

export interface Properties {
  onSelected: (images: Media[]) => void;
  mimeTypes?: any;
  maxSize?: number;
}

interface State {
  isDropRejectedNotificationOpen: boolean;
}

export default class Menu extends React.Component<Properties, State> {
  state = { isDropRejectedNotificationOpen: false };

  imagesSelected = (acceptedFiles): void => {
    this.setState({ isDropRejectedNotificationOpen: false });

    const newImages: Media[] = dropzoneToMedia(acceptedFiles);

    if (newImages.length) {
      this.props.onSelected(newImages);
    }
  };

  renderToastNotification = () => {
    const maxSize = formatFileSize(this.props.maxSize);

    return (
      <ToastNotification
        viewportClassName='invite-toast-notification'
        title=''
        description={`File exceeds ${maxSize} size limit`}
        actionAltText=''
        positionVariant='left'
        openToast={this.state.isDropRejectedNotificationOpen}
      />
    );
  };

  onDropRejected = (rejectedFiles) => {
    const rejectedFile = rejectedFiles[0]; // Assuming only one file is rejected
    if (rejectedFile?.errors[0]?.code === 'file-too-large') {
      // Reset first, then show again to ensure the toast can be triggered multiple times
      this.setState({ isDropRejectedNotificationOpen: false }, () => {
        this.setState({ isDropRejectedNotificationOpen: true });
      });
    }
  };

  render() {
    return (
      <>
        <Dropzone
          onDropRejected={this.onDropRejected}
          onDrop={this.imagesSelected}
          accept={this.props.mimeTypes}
          maxSize={this.props.maxSize}
        >
          {({ getRootProps, getInputProps, open }) => (
            <div className='image-send'>
              <div {...getRootProps({ className: 'image-send__dropzone' })}>
                <input {...getInputProps()} />
                <IconButton onClick={open} Icon={IconPlus} size={26} />
              </div>
            </div>
          )}
        </Dropzone>
        {this.renderToastNotification()}
      </>
    );
  }
}
