import React from 'react';
import Dropzone from 'react-dropzone';
import { bytesToMB, dropzoneToMedia, Media } from '../../../../../components/message-input/utils';
import { IconPlus } from '@zero-tech/zui/icons';
import { IconButton, ToastNotification } from '@zero-tech/zui/components';
import { config } from '../../../../../config';

import './styles.scss';

export interface Properties {
  onSelected: (media: Media[]) => void;
}

interface State {
  isDropRejectedNotificationOpen: boolean;
}

export class PostMediaMenu extends React.Component<Properties, State> {
  state = { isDropRejectedNotificationOpen: false };

  mediaSelected = (acceptedFiles): void => {
    this.setState({ isDropRejectedNotificationOpen: false });

    const newMedia: Media[] = dropzoneToMedia(acceptedFiles);

    if (newMedia.length) {
      this.props.onSelected(newMedia);
    }
  };

  renderToastNotification = () => {
    const maxSize = bytesToMB(config.cloudinary.max_file_size);

    return (
      <ToastNotification
        viewportClassName='post-media-toast-notification'
        title=''
        description={`File exceeds ${maxSize} size limit`}
        actionAltText=''
        positionVariant='left'
        openToast={this.state.isDropRejectedNotificationOpen}
      />
    );
  };

  onDropRejected = (rejectedFiles) => {
    const rejectedFile = rejectedFiles[0];
    if (rejectedFile?.errors[0]?.code === 'file-too-large') {
      this.setState({ isDropRejectedNotificationOpen: true });
    }
  };

  render() {
    return (
      <>
        <Dropzone
          onDropRejected={this.onDropRejected}
          onDrop={this.mediaSelected}
          accept={{ 'image/*': [], 'image/gif': ['.gif'], 'video/*': [] }}
          maxSize={config.cloudinary.max_file_size}
        >
          {({ getRootProps, getInputProps, open }) => (
            <div className='post-media-menu'>
              <div {...getRootProps({ className: 'post-media-menu__dropzone' })}>
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
