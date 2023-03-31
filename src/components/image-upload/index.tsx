import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import './styles.scss';

export interface Properties {
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
          <section className='image-upload'>
            {this.state.files.length === 0 ? (
              <div {...getRootProps({ className: 'image-upload__dropzone' })}>
                <input {...getInputProps()} />
                <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M2 3C2 2.44772 2.44772 2 3 2H21C21.5523 2 22 2.44772 22 3C22 3.55228 21.5523 4 21 4H3C2.44772 4 2 3.55228 2 3Z'
                    fill='#EDEDEF'
                  />
                  <path
                    d='M5.29289 13.7071C5.68342 14.0976 6.31658 14.0976 6.70711 13.7071L11 9.41421L11 21C11 21.5523 11.4477 22 12 22C12.5523 22 13 21.5523 13 21L13 9.41421L17.2929 13.7071C17.6834 14.0976 18.3166 14.0976 18.7071 13.7071C19.0976 13.3166 19.0976 12.6834 18.7071 12.2929L12.7071 6.29289C12.3166 5.90237 11.6834 5.90237 11.2929 6.29289L5.29289 12.2929C4.90237 12.6834 4.90237 13.3166 5.29289 13.7071Z'
                    fill='#EDEDEF'
                  />
                </svg>
                <p>Select or drag &amp; drop</p>
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
