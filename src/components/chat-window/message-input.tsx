import React from 'react';

import classNames from 'classnames';

require('./styles.scss');

export interface Properties {
  className?: string;
  placeholder?: string;
  onSubmit: (content: string) => void;
}

export class MessageInput extends React.Component<Properties> {
  submit = (e) => {
    if (!e.shiftKey && e.keyCode === 13 && e.target.value) {
      e.preventDefault();
      this.props.onSubmit(e.target.value);
    }
  };

  render() {
    return (
      <div className={classNames('message-input', this.props.className)}>
        <div className='message-input__input-wrapper'>
          <div className='mentions-text-area message-input__textarea'>
            <div className='mentions-text-area__wrap mentions-text-area__wrap--multiLine'>
              <div className='mentions-text-area__wrap__highlighter'>
                <span className='mentions-text-area__wrap__highlighter__substring'></span>{' '}
              </div>
              <textarea
                className='mentions-text-area__wrap__input'
                placeholder={this.props.placeholder}
                onKeyDown={this.submit}
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
