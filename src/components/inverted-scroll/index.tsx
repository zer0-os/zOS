import React from 'react';
import classNames from 'classnames';

import './styles.scss';

export interface Properties {
  className?: string;
}

export class InvertedScroll extends React.Component<Properties, undefined> {
  scrollWrapper: HTMLElement;
  cancelScrollFixer: boolean = false;

  getSnapshotBeforeUpdate() {
    if (this.scrollWrapper) {
      return {
        scrollHeight: this.scrollWrapper.scrollHeight,
        scrollTop: this.scrollWrapper.scrollTop,
        clientHeight: this.scrollWrapper.clientHeight,
      };
    }

    return null;
  }

  componentDidUpdate(_prevProps, _prevState, snapshot) {
    if (snapshot) {
      this.adjustScrollPositionForContentChanges(snapshot);
    }
  }

  adjustScrollPositionForContentChanges(snapshot?: { scrollHeight: number; scrollTop: number; clientHeight: number }) {
    const addedContentHeight = this.scrollWrapper.scrollHeight - snapshot.scrollHeight;

    // The bottom point of the scrolled view port as a percentage
    const distanceFromBottomPixels = snapshot
      ? snapshot.scrollHeight - (snapshot.scrollTop + snapshot.clientHeight)
      : 0;

    const isSnapshotHeightSame = snapshot && snapshot.scrollHeight === this.scrollWrapper.scrollHeight;

    if (distanceFromBottomPixels < 200) {
      if (!isSnapshotHeightSame) {
        this.scrollToBottom();
      }
    } else if (addedContentHeight > 61) {
      // should mostly avoid jumping when new messages come in unless more than 2 lines long.
      this.scrollWrapper.scrollTop = snapshot.scrollTop + addedContentHeight;
    }
  }

  scrollToBottom() {
    this.scrollWrapper.scrollTop = this.scrollWrapper.scrollHeight;
  }

  setScrollWrapper = (element: HTMLElement) => {
    if (!element) {
      return;
    }

    this.scrollWrapper = element;

    this.scrollToBottom();
  };

  render() {
    return (
      <div className={classNames('scroll-container', this.props.className)}>
        <div
          className='scroll-container__content-wrapper'
          ref={this.setScrollWrapper}
        >
          <div className='scroll-container__children'>{this.props.children}</div>
        </div>
      </div>
    );
  }
}

export default InvertedScroll;
