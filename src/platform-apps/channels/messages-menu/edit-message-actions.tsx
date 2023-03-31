import React from 'react';

export interface Properties {
  className?: string;
  onEdit: () => void;
  onCancel?: () => void;
}

export default class EditMessageActions extends React.Component<Properties> {
  render() {
    return (
      <div className='edit-message__actions'>
        <button className='icon-button address-bar__navigation-button' onClick={this.props.onEdit}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24px'
            height='24px'
            viewBox='0 0 24 24'
            role='img'
            aria-labelledby='okIconTitle'
            stroke='#FFFFFF'
            stroke-width='1'
            stroke-linecap='square'
            stroke-linejoin='miter'
            fill='none'
            color='#FFFFFF'
          >
            {' '}
            <title id='okIconTitle'>Ok</title> <polyline points='4 13 9 18 20 7' />{' '}
          </svg>
        </button>
        <button className='icon-button address-bar__navigation-button' onClick={this.props.onCancel}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24px'
            height='24px'
            viewBox='0 0 24 24'
            role='img'
            stroke='#FFFFFF'
            aria-labelledby='closeIconTitle'
            stroke-width='1'
            stroke-linecap='square'
            stroke-linejoin='miter'
            fill='none'
            color='#FFFFFF'
          >
            {' '}
            <title id='closeIconTitle'>Close</title>{' '}
            <path d='M6.34314575 6.34314575L17.6568542 17.6568542M6.34314575 17.6568542L17.6568542 6.34314575' />{' '}
          </svg>
        </button>
      </div>
    );
  }
}
