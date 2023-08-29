import React from 'react';
import classNames from 'classnames';
import debounce from 'lodash.debounce';
import './styles.scss';

const SCROLL_HEIGHT_FIXER_DELAY_MS = 5;
const SCROLL_HEIGHT_FIXER_ITERATIONS = 200;

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

    this.scrollFixer();
  }

  setScrollWrapper = (element: HTMLElement) => {
    if (!element) {
      return;
    }
    this.scrollWrapper = element;
    this.scrollToBottom();
  };

  fixScroll = debounce((oldScrollHeight: number, iterations: number = 0) => {
    if (this.scrollWrapper.scrollHeight !== oldScrollHeight) {
      this.scrollWrapper.scrollTop = this.scrollWrapper.scrollHeight;
      // Schedule another fix scroll again incase more load in with current scroll height
      this.fixScroll(this.scrollWrapper.scrollHeight);
    } else if (iterations < SCROLL_HEIGHT_FIXER_ITERATIONS) {
      // Schedule another until iterations run out
      // Will be cancelled if scrolling upwards.
      this.fixScroll(oldScrollHeight, iterations + 1);
    }
  }, SCROLL_HEIGHT_FIXER_DELAY_MS);

  scrollFixer = () => {
    const oldScrollHeight = this.scrollWrapper.scrollHeight;

    this.fixScroll(oldScrollHeight);
  };

  render() {
    return (
      <div className={classNames('scroll-container', this.props.className)} ref={this.setScrollWrapper}>
        <div className='scroll-container__children'>{this.props.children}</div>
      </div>
    );
  }
}
export default InvertedScroll;
