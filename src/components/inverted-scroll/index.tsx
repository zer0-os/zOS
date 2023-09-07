import React from 'react';
import classNames from 'classnames';
import './styles.scss';
import { bemClassName } from '../../lib/bem';
import { Waypoint } from 'react-waypoint';

const cn = bemClassName('inverted-scroll');

export interface Properties {
  className?: string;
}

interface State {
  pinnedBottom: boolean;
}

export class InvertedScroll extends React.Component<Properties, State> {
  state = { pinnedBottom: false };
  scrollWrapper: HTMLElement;

  scrollToBottom() {
    console.log('manual scroll');
    this.pinBottom();
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

  pinBottom = () => this.setState({ pinnedBottom: true });
  unpinBottom = () => this.setState({ pinnedBottom: false });

  render() {
    return (
      <div
        id='invert-scroll'
        className={classNames('scroll-container', this.props.className)}
        ref={this.setScrollWrapper}
      >
        <div {...cn('content', this.state.pinnedBottom && 'pinned-bottom')}>{this.props.children}</div>
        <div {...cn('bottom-anchor')}>
          <Waypoint onEnter={this.pinBottom} onLeave={this.unpinBottom} />
        </div>
      </div>
    );
  }
}

export default InvertedScroll;
