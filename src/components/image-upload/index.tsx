import React, { Component, ReactElement } from 'react';
import Dropzone from 'react-dropzone';
import './styles.scss';
import classNames from 'classnames';

export interface Properties {
  className?: string;
  icon: ReactElement;
  uploadText: string;
  onChange: (file: File) => void;
}

interface State {
  files: any;
}

export class ImageUpload extends Component<Properties, State> {
  state = { files: [] };

  onDrop = (files) => {
    this.setState({ files });

    if (typeof this.props.onChange === 'function') {
      this.props.onChange(files[0]);
    }
  };

  renderImage = () => {
    const file = this.state.files[0];

    return (
      <img
        className='image-upload__image'
        src={URL.createObjectURL(file)}
        onLoad={() => {
          URL.revokeObjectURL(file.preview);
        }}
        alt='Profile'
      />
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
