import React from 'react';
import { Option as OptionModel } from './';

export interface Properties {
  data?: OptionModel;
}

export class Option extends React.Component<Properties> {
  render() {
    const { label, image } = this.props.data;

    return (
      <>
        {image && (
          <img
            className='chat-select__option-image'
            src={image}
            alt='member'
          />
        )}
        <span className='chat-select__option-label'>{label}</span>
      </>
    );
  }
}
