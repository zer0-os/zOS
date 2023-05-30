import React, { Component, ReactElement } from 'react';
import Dropzone from 'react-dropzone';

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

  openFileDialog = () => {
    if (this.fileInputRef.current) {
      this.fileInputRef.current.click();
    }
  };

  onEditClick = () => {
    if (this.fileInputRef.current) {
      this.fileInputRef.current.click();
    }
  };

  handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      this.onDrop(Array.from(e.target.files));
    }
  };

  onDrop = (files: File[]) => {
    this.setState({ files });

    if (typeof this.props.onChange === 'function') {
      this.props.onChange(files[0]);
    }
  };

  renderImage = () => {
    const file = this.state.files[0];

    return (
      <div className='image-upload__image-container'>
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
          onClick={this.onEditClick}
        />
        <input type='file' className='image-upload__input' ref={this.fileInputRef} onChange={this.handleFileChange} />
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
            {this.state.files.length === 0 ? (
              <div {...getRootProps({ className: 'image-upload__dropzone' })}>
                <input {...getInputProps()} />
                {this.props.icon}
                <p>{this.props.uploadText}</p>
              </div>
            ) : (
              this.renderImage()
            )}
          </section>
        )}
      </Dropzone>
    );
  }
}
