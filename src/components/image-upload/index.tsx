import React, { Component, ReactElement } from 'react';
import Dropzone, { DropzoneRootProps, DropzoneInputProps } from 'react-dropzone';

import { IconAlertCircle, IconEdit5 } from '@zero-tech/zui/icons';
import { IconButton } from '@zero-tech/zui/components';

import './styles.scss';
import classNames from 'classnames';

export interface Properties {
  className?: string;
  icon: ReactElement;
  uploadText?: string;
  onChange: (file: File) => void;
  isError?: boolean;
  errorMessage?: string;
  imageSrc?: string;
}

interface State {
  files: File[];
}

export class ImageUpload extends Component<Properties, State> {
  state = { files: [] };
  fileInputRef = React.createRef<HTMLInputElement>();

  dataVariant = this.props.isError ? 'error' : '';
  icon = this.props.isError ? <IconAlertCircle isFilled /> : this.props.icon;
  textContent = this.props.isError ? this.state?.files[0]?.name : this.props.uploadText;
  errorMessage = this.props.errorMessage || 'Image upload failed. Please try again.';

  onDrop = (files: File[]) => {
    this.setState({ files });

    if (typeof this.props.onChange === 'function') {
      this.props.onChange(files[0]);
    }
  };

  onSimulateClick = () => {
    if (this.fileInputRef.current) {
      this.fileInputRef.current.click(); // simulating a click on the file input when the button is clicked
    }
  };

  renderImage = (rootProps: DropzoneRootProps, inputProps: DropzoneInputProps) => {
    const file = this.state.files[0];

    return (
      <div {...rootProps} className='image-upload__image-container'>
        <input {...inputProps} ref={this.fileInputRef} />
        <img
          className='image-upload__image'
          src={file ? URL.createObjectURL(file) : this.props.imageSrc}
          onLoad={() => {
            if (file) {
              URL.revokeObjectURL(file);
            }
          }}
          alt='Profile'
        />
        <IconButton
          className={'image-upload__edit-button'}
          size='small'
          type='button'
          variant='primary'
          Icon={IconEdit5}
          onClick={this.onSimulateClick}
        />
      </div>
    );
  };

  renderPlaceholder = (rootProps: DropzoneRootProps, inputProps: DropzoneInputProps) => {
    return (
      <div {...rootProps} className='image-upload__dropzone'>
        <input {...inputProps} />
        {this.icon}
        {this.textContent && <p className='image-upload__text-content'>{this.textContent}</p>}
      </div>
    );
  };

  render() {
    return (
      <Dropzone
        onDrop={this.onDrop}
        accept={{
          'image/*': [],
        }}
        maxFiles={1}
      >
        {({ getRootProps, getInputProps }) => (
          <div className='image-upload-container'>
            <section className={classNames('image-upload', this.props.className)} data-variant={this.dataVariant}>
              {this.state.files.length === 0 && !this.props.imageSrc
                ? this.renderPlaceholder(getRootProps(), getInputProps())
                : this.renderImage(getRootProps(), getInputProps())}
            </section>
            {this.props.isError && <div className='image-upload__error-message'>{this.errorMessage}</div>}
          </div>
        )}
      </Dropzone>
    );
  }
}
