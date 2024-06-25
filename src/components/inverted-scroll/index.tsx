import React, { ReactNode } from 'react';
import classNames from 'classnames';
import './styles.scss';
import { bemClassName } from '../../lib/bem';
import { Waypoint } from 'react-waypoint';

const cn = bemClassName('inverted-scroll');

export interface Properties {
  children?: ReactNode;
  className?: string;
  isScrollbarHidden?: boolean;
}

interface State {
  pinnedBottom: boolean;
}

export class InvertedScroll extends React.Component<Properties, State> {
  state = { pinnedBottom: false };
  scrollWrapper: HTMLElement;

  scrollToBottom() {
    this.pinBottom();
    this.scrollWrapper.scrollTop = this.scrollWrapper.scrollHeight;
  }

  setScrollWrapper = (element: HTMLElement) => {
    if (!element) {
      return;
    }

    this.scrollWrapper = element;
    this.scrollToBottom();
  };

  preventHigherScroll = () => {
    // If we get fully scrolled to the top, scroll down a bit to prevent
    // the browser from pinning our position to the top of the scroll view.
    if (this.scrollWrapper) {
      this.scrollWrapper.scroll(0, 1);
    }
  };

  pinBottom = () => this.setState({ pinnedBottom: true });
  unpinBottom = () => this.setState({ pinnedBottom: false });

  render() {
    return (
      <div
        id='invert-scroll'
        className={classNames(
          'scroll-container',
          this.props.className,
          this.props.isScrollbarHidden && 'scrollbar-hidden'
        )}
        ref={this.setScrollWrapper}
      >
        <Waypoint onEnter={this.preventHigherScroll} />
        <div {...cn('content', this.state.pinnedBottom && 'pinned-bottom')}>{this.props.children}</div>
        <div {...cn('bottom-anchor')}>
          <Waypoint onEnter={this.pinBottom} onLeave={this.unpinBottom} />
        </div>
      </div>
    );
  }
}

export default InvertedScroll;
