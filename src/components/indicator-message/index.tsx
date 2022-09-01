import classNames from 'classnames';
import React from 'react';

import './styles.scss';

interface Properties {
  countNewMessage: number;
  className?: string;
  bottomRef?: any;
  closeIndicator: () => void;
}

export class IndicatorMessage extends React.Component<Properties> {
  render() {
    return (
      <div className={classNames('countNewMessage', this.props.className)}>
        {this.props.countNewMessage > 0 && (
          <div className='indicator__new-message'>
            <button
              type='button'
              className='indicator__new-message-bar'
              aria-label='Jump to last unread message'
              onClick={this.props.closeIndicator}
            >
              <span className='indicator__new-message-bar-text'>{this.props.countNewMessage} new messages</span>
            </button>
            <button
              type='button'
              className='indicator__new-message-alt'
              onClick={this.props.closeIndicator}
            >
              Mark As Read
              <svg
                aria-hidden='true'
                role='img'
                width='24'
                height='24'
                viewBox='0 0 24 24'
              >
                <path
                  fill='currentColor'
                  fill-rule='evenodd'
                  clip-rule='evenodd'
                  d='M12.291 5.70697L15.998 9.41397L21.705 3.70697L20.291 2.29297L15.998 6.58597L13.705 4.29297L12.291 5.70697ZM1.99805 7H11.088C11.564 9.837 14.025 12 16.998 12V18C16.998 19.103 16.102 20 14.998 20H8.33205L2.99805 24V20H1.99805C0.894047 20 -0.00195312 19.103 -0.00195312 18V9C-0.00195312 7.897 0.894047 7 1.99805 7Z'
                ></path>
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }
}

export default IndicatorMessage;
