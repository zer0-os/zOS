import React, { Component, ReactElement } from 'react';
import Dropzone, { DropzoneRootProps, DropzoneInputProps } from 'react-dropzone';

import { IconEdit5 } from '@zero-tech/zui/icons';
import { IconButton } from '@zero-tech/zui/components';

import './styles.scss';
import classNames from 'classnames';

export interface Properties {
  className?: string;
  icon: ReactElement;
  uploadText: string;
  onChange: (file: File) => void;
}

interface State {
  files: File[];
}

export class ImageUpload extends Component<Properties, State> {
  state = { files: [] };
  fileInputRef = React.createRef<HTMLInputElement>();

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
          src={URL.createObjectURL(file)}
          onLoad={() => {
            URL.revokeObjectURL(file.preview);
          }}
          alt='Profile'
        />
        <IconButton
          className={'image-upload__edit-button'}
          type='button'
          color='primary'
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
        {this.props.icon}
        <p>{this.props.uploadText}</p>
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
          <section className={classNames('image-upload', this.props.className)}>
            {this.state.files.length === 0
              ? this.renderPlaceholder(getRootProps(), getInputProps())
              : this.renderImage(getRootProps(), getInputProps())}
          </section>
        )}
      </Dropzone>
    );
  }
}
