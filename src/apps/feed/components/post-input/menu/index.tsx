import React from 'react';
import Dropzone from 'react-dropzone';
import { bytesToMB, dropzoneToMedia, Media } from '../../../../../components/message-input/utils';
import { getPostMediaMaxFileSize, validateMediaFiles } from '../utils';
import { IconImage1 } from '@zero-tech/zui/icons';
import { IconButton, ToastNotification } from '@zero-tech/zui/components';
import { config } from '../../../../../config';

import './styles.scss';

export interface Properties {
  onSelected: (media: Media[]) => void;
}

interface State {
  isDropRejectedNotificationOpen: boolean;
  rejectedType: string | null;
}

export class PostMediaMenu extends React.Component<Properties, State> {
  state = { isDropRejectedNotificationOpen: false, rejectedType: null };

  mediaSelected = (acceptedFiles): void => {
    this.setState({ isDropRejectedNotificationOpen: false, rejectedType: null });
    const { validFiles, rejectedFiles } = validateMediaFiles(acceptedFiles);
    if (rejectedFiles.length > 0) {
      this.setState({ isDropRejectedNotificationOpen: false, rejectedType: null }, () => {
        this.setState({ isDropRejectedNotificationOpen: true, rejectedType: rejectedFiles[0].file.type });
      });
    }
    const newMedia: Media[] = dropzoneToMedia(validFiles);
    if (newMedia.length) {
      this.props.onSelected(newMedia);
    }
  };

  renderToastNotification = () => {
    let maxSize = config.postMedia.imageMaxFileSize;
    if (this.state.rejectedType) {
      maxSize = getPostMediaMaxFileSize(this.state.rejectedType);
    }
    const maxSizeMB = bytesToMB(maxSize);

    if (!this.state.isDropRejectedNotificationOpen) {
      return null;
    }

    return (
      <ToastNotification
        viewportClassName='post-media-toast-notification'
        title=''
        description={`File exceeds ${maxSizeMB} size limit`}
        actionAltText=''
        positionVariant='left'
        openToast={this.state.isDropRejectedNotificationOpen}
      />
    );
  };

  onDropRejected = (rejectedFiles) => {
    const rejectedFile = rejectedFiles[0];
    if (rejectedFile?.errors[0]?.code === 'file-too-large') {
      // Reset first, then show again
      this.setState({ isDropRejectedNotificationOpen: false, rejectedType: null }, () => {
        this.setState({ isDropRejectedNotificationOpen: true, rejectedType: rejectedFile.file.type });
      });
    }
  };

  render() {
    const maxSize = Math.max(
      config.postMedia.imageMaxFileSize,
      config.postMedia.gifMaxFileSize,
      config.postMedia.videoMaxFileSize
    );

    return (
      <>
        <Dropzone
          onDropRejected={this.onDropRejected}
          onDrop={this.mediaSelected}
          accept={{ 'image/*': [], 'image/gif': ['.gif'], 'video/*': [] }}
          maxSize={maxSize}
        >
          {({ getRootProps, getInputProps, open }) => (
            <div className='post-media-menu'>
              <div {...getRootProps({ className: 'post-media-menu__dropzone' })}>
                <input {...getInputProps()} />
                <IconButton onClick={open} Icon={() => <IconImage1 size={18} />} size={36} />
              </div>
            </div>
          )}
        </Dropzone>
        {this.renderToastNotification()}
      </>
    );
  }
}
