import React, { Fragment } from 'react';

import { Skeleton } from '@zero-tech/zui/components';
import { bem } from '../../lib/bem';

const c = bem('chat-skeleton');

export interface Properties {
  conversationId: string;
  short?: boolean;
}

interface State {
  skeletonId: number;
}

// Cheezy way to store the last rendered id. This works for now
// because we only ever render one chat skeleton at a given time.
let lastSkeletonId = -1;

export class ChatSkeleton extends React.Component<Properties, State> {
  state = { skeletonId: -1 };

  constructor(props) {
    super(props);
    this.state = { skeletonId: this.setNextSkeleton() };
  }

  componentDidUpdate(prevProps: Readonly<Properties>): void {
    if (prevProps.conversationId !== this.props.conversationId) {
      this.setState({ skeletonId: this.setNextSkeleton() });
    }
  }

  setNextSkeleton() {
    lastSkeletonId = (lastSkeletonId + 1) % 3;
    return lastSkeletonId;
  }

  render() {
    return (
      <div className={c('')}>
        {/* @TODO: temporarily workaround due to error
		{this.state.skeletonId === 0 && <ChatSkeleton1 short={!!this.props.short} />}
        {this.state.skeletonId === 1 && <ChatSkeleton2 short={!!this.props.short} />}
        {this.state.skeletonId >= 2 && <ChatSkeleton3 short={!!this.props.short} />} 
		*/}
      </div>
    );
  }
}

/*
class ChatSkeleton1 extends React.PureComponent<{ short: boolean }> {
  get nodes() {
    return [
      <div className={c('date')}>
        <div>
          <Skeleton width='100%' height='100%' />
        </div>
      </div>,
      <div className={c('message')}>
        <Skeleton width='270px' height='33px' />
      </div>,
      <div className={c('message', 'owner')}>
        <Skeleton width='270px' height='65px' />
      </div>,
      <div className={c('message')}>
        <Skeleton width='270px' height='33px' />
      </div>,
      <div className={c('message')}>
        <Skeleton width='520px' height='99px' />
      </div>,
      <div className={c('message')}>
        <Skeleton width='270px' height='33px' />
      </div>,
      <div className={c('date')}>
        <div>
          <Skeleton width='100%' height='100%' />
        </div>
      </div>,
      <div className={c('message', 'owner')}>
        <Skeleton width='202px' height='33px' />
      </div>,
      <div className={c('message', 'owner')}>
        <Skeleton width='520px' height='69px' />
      </div>,
      <div className={c('message', 'owner')}>
        <Skeleton width='310px' height='33px' />
      </div>,
      <div className={c('message')}>
        <Skeleton width='181px' height='33px' />
      </div>,
      <div className={c('message', 'owner')}>
        <Skeleton width='270px' height='33px' />
      </div>,
      <div className={c('message', 'owner')}>
        <Skeleton width='270px' height='33px' />
      </div>,
      <div className={c('message')}>
        <Skeleton width='270px' height='33px' />
      </div>,
      <div className={c('message')}>
        <Skeleton width='520px' height='71px' />
      </div>,
      <div className={c('message', 'owner')}>
        <Skeleton width='217px' height='33px' />
      </div>,
      <div className={c('date')}>
        <div>
          <Skeleton width='100%' height='100%' />
        </div>
      </div>,
    ];
  }

  render() {
    const renderNodes = this.props.short ? this.nodes.slice(-3) : this.nodes;
    return renderNodes.map((n, index) => <Fragment key={index}>{n}</Fragment>);
  }
}

class ChatSkeleton2 extends React.PureComponent<{ short: boolean }> {
  get nodes() {
    return [
      <div className={c('date')}>
        <div>
          <Skeleton width='100%' height='100%' />
        </div>
      </div>,
      <div className={c('message', 'owner')}>
        <Skeleton width='270px' height='33px' />
      </div>,
      <div className={c('message')}>
        <Skeleton width='270px' height='65px' />
      </div>,
      <div className={c('message', 'owner')}>
        <Skeleton width='270px' height='33px' />
      </div>,
      <div className={c('message', 'owner')}>
        <Skeleton width='520px' height='75px' />
      </div>,
      <div className={c('message', 'owner')}>
        <Skeleton width='336px' height='33px' />
      </div>,
      <div className={c('message')}>
        <Skeleton width='202px' height='33px' />
      </div>,
      <div className={c('message')}>
        <Skeleton width='310px' height='33px' />
      </div>,
      <div className={c('message')}>
        <Skeleton width='249px' height='33px' />
      </div>,
      <div className={c('date')}>
        <div>
          <Skeleton width='100%' height='100%' />
        </div>
      </div>,
      <div className={c('message', 'owner')}>
        <Skeleton width='206px' height='33px' />
      </div>,
      <div className={c('message', 'owner')}>
        <Skeleton width='270px' height='33px' />
      </div>,
      <div className={c('message', 'owner')}>
        <Skeleton width='520px' height='71px' />
      </div>,
      <div className={c('message')}>
        <Skeleton width='270px' height='33px' />
      </div>,
      <div className={c('message')}>
        <Skeleton width='142px' height='33px' />
      </div>,
      <div className={c('message', 'owner')}>
        <Skeleton width='270px' height='33px' />
      </div>,
      <div className={c('message', 'owner')}>
        <Skeleton width='520px' height='33px' />
      </div>,
    ];
  }

  render() {
    const renderNodes = this.props.short ? this.nodes.slice(-3) : this.nodes;
    return renderNodes.map((n, index) => <Fragment key={index}>{n}</Fragment>);
  }
}

class ChatSkeleton3 extends React.PureComponent<{ short: boolean }> {
  get nodes() {
    return [
      <div className={c('message', 'owner')}>
        <Skeleton width='270px' height='65px' />
      </div>,
      <div className={c('message')}>
        <Skeleton width='270px' height='33px' />
      </div>,
      <div className={c('message')}>
        <Skeleton width='520px' height='99px' />
      </div>,
      <div className={c('message')}>
        <Skeleton width='270px' height='33px' />
      </div>,
      <div className={c('date')}>
        <div>
          <Skeleton width='100%' height='100%' />
        </div>
      </div>,
      <div className={c('message', 'owner')}>
        <Skeleton width='202px' height='33px' />
      </div>,
      <div className={c('message', 'owner')}>
        <Skeleton width='310px' height='33px' />
      </div>,
      <div className={c('message', 'owner')}>
        <Skeleton width='249px' height='33px' />
      </div>,
      <div className={c('message')}>
        <Skeleton width='206px' height='33px' />
      </div>,
      <div className={c('message')}>
        <Skeleton width='270px' height='33px' />
      </div>,
      <div className={c('message')}>
        <Skeleton width='520px' height='135px' />
      </div>,
      <div className={c('date')}>
        <div>
          <Skeleton width='100%' height='100%' />
        </div>
      </div>,
      <div className={c('message', 'owner')}>
        <Skeleton width='270px' height='33px' />
      </div>,
      <div className={c('message', 'owner')}>
        <Skeleton width='270px' height='33px' />
      </div>,
      <div className={c('message')}>
        <Skeleton width='270px' height='33px' />
      </div>,
      <div className={c('message')}>
        <Skeleton width='520px' height='33px' />
      </div>,
      <div className={c('message', 'owner')}>
        <Skeleton width='206px' height='33px' />
      </div>,
      <div className={c('message', 'owner')}>
        <Skeleton width='270px' height='33px' />
      </div>,
    ];
  }

  render() {
    const renderNodes = this.props.short ? this.nodes.slice(-3) : this.nodes;
    return renderNodes.map((n, index) => <Fragment key={index}>{n}</Fragment>);
  }
}
*/
