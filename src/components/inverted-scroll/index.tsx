import React from 'react';
import classNames from 'classnames';
import './styles.scss';

export interface Properties {
  className?: string;
}

export class InvertedScroll extends React.Component<Properties, undefined> {
  scrollWrapper: HTMLElement;

  scrollToBottom() {
    console.log('manual scroll');
    this.scrollWrapper.scrollTop = this.scrollWrapper.scrollHeight;
  }

  scroll(x, y) {
    this.scrollWrapper.scroll(x, y);
  }

  // XXX: do we need this really?
  setScrollWrapper = (element: HTMLElement) => {
    if (!element) {
      return;
    }

    this.scrollWrapper = element;

    this.scrollToBottom();
  };

  render() {
    return (
      <div
        id='invert-scroll'
        className={classNames('scroll-container', this.props.className)}
        ref={this.setScrollWrapper}
      >
        {this.props.children}
      </div>
    );
  }
}

export default InvertedScroll;
