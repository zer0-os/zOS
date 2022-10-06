import React from 'react';

import classNames from 'classnames';

require('./styles.scss');

export interface Properties {
  className?: string;
  placeholder?: string;
  isUserConnected?: boolean; // ToDo: rename to authenticated
  onSubmit: (message: string) => void;
}

interface State {
  value: string;
}

export class MessageInput extends React.Component<Properties, State> {
  state = { value: '' };
  onSubmit = (event) => {
    // ToDo: switch keyCode for key
    if (!event.shiftKey && event.keyCode === 13 && event.target.value) {
      event.preventDefault();
      this.props.onSubmit(event.target.value);
      this.setState({ value: '' });
    }
  };

  renderInput() {
    return (
      // ToDo: rename chat-window
      <div className='message-input chat-window__new-message'>
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
    return (
      <div className={classNames('chat-window__input-wrapper', this.props.className)}>
        {this.props.isUserConnected && this.renderInput()}
      </div>
    );
  }
}
