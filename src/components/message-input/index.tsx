import React from 'react';

import classNames from 'classnames';
import { Key } from '../../lib/keyboard-search';

require('./styles.scss');

export interface Properties {
  className?: string;
  placeholder?: string;
  onSubmit: (message: string) => void;
}

interface State {
  value: string;
}

export class MessageInput extends React.Component<Properties, State> {
  state = { value: '' };
  onSubmit = (event) => {
    const {
      target: { value },
    } = event;

    if (!event.shiftKey && event.key === Key.Enter && value) {
      event.preventDefault();
      this.props.onSubmit(value);
      this.setState({ value: '' });
    }
  };

  renderInput() {
    return (
      <div className='message-input chat-message__new-message'>
        <div className='message-input__input-wrapper'>
          <div className='mentions-text-area message-input__textarea'>
            <div className='mentions-text-area__wrap mentions-text-area__wrap--multiLine'>
              <div className='mentions-text-area__wrap__highlighter'>
                <span className='mentions-text-area__wrap__highlighter__substring'></span>{' '}
              </div>
              <textarea
                className='mentions-text-area__wrap__input'
                placeholder={this.props.placeholder}
                onKeyDown={this.onSubmit}
                onChange={(event) => this.setState({ value: event.target.value })}
                value={this.state.value}
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return <div className={classNames('chat-message__input-wrapper', this.props.className)}>{this.renderInput()}</div>;
  }
}
