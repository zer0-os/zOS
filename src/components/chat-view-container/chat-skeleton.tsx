import React from 'react';

import { Skeleton } from '@zero-tech/zui/components';
import { bem } from '../../lib/bem';

const c = bem('chat-skeleton');

export interface Properties {
  templateNumber: 1 | 2 | 3;
}

export class ChatSkeleton extends React.Component<Properties> {
  render() {
    return (
      <div className={c('')}>
        {this.props.templateNumber === 1 && <ChatSkeleton1 />}
        {this.props.templateNumber === 2 && <ChatSkeleton2 />}
        {this.props.templateNumber === 3 && <ChatSkeleton3 />}
      </div>
    );
  }
}

class ChatSkeleton1 extends React.PureComponent {
  render() {
    return (
      <>
        <div className={c('date')}>
          <div>
            <Skeleton width='100%' height='100%' />
          </div>
        </div>
        <div className={c('message')}>
          <Skeleton width='270px' height='33px' />
        </div>
        <div className={c('message', 'owner')}>
          <Skeleton width='270px' height='65px' />
        </div>
        <div className={c('message')}>
          <Skeleton width='270px' height='33px' />
        </div>
        <div className={c('message')}>
          <Skeleton width='520px' height='99px' />
        </div>
        <div className={c('message')}>
          <Skeleton width='270px' height='33px' />
        </div>
        <div className={c('date')}>
          <div>
            <Skeleton width='100%' height='100%' />
          </div>
        </div>
        <div className={c('message', 'owner')}>
          <Skeleton width='202px' height='33px' />
        </div>
        <div className={c('message', 'owner')}>
          <Skeleton width='520px' height='69px' />
        </div>
        <div className={c('message', 'owner')}>
          <Skeleton width='310px' height='33px' />
        </div>
        <div className={c('message')}>
          <Skeleton width='181px' height='33px' />
        </div>
        <div className={c('message', 'owner')}>
          <Skeleton width='270px' height='33px' />
        </div>
        <div className={c('message', 'owner')}>
          <Skeleton width='270px' height='33px' />
        </div>
        <div className={c('message')}>
          <Skeleton width='270px' height='33px' />
        </div>
        <div className={c('message')}>
          <Skeleton width='520px' height='71px' />
        </div>
        <div className={c('message', 'owner')}>
          <Skeleton width='217px' height='33px' />
        </div>
        <div className={c('date')}>
          <div>
            <Skeleton width='100%' height='100%' />
          </div>
        </div>
      </>
    );
  }
}

class ChatSkeleton2 extends React.PureComponent {
  render() {
    return (
      <>
        <div className={c('date')}>
          <div>
            <Skeleton width='100%' height='100%' />
          </div>
        </div>
        <div className={c('message', 'owner')}>
          <Skeleton width='270px' height='33px' />
        </div>
        <div className={c('message')}>
          <Skeleton width='270px' height='65px' />
        </div>
        <div className={c('message', 'owner')}>
          <Skeleton width='270px' height='33px' />
        </div>
        <div className={c('message', 'owner')}>
          <Skeleton width='520px' height='75px' />
        </div>
        <div className={c('message', 'owner')}>
          <Skeleton width='336px' height='33px' />
        </div>
        <div className={c('message')}>
          <Skeleton width='202px' height='33px' />
        </div>
        <div className={c('message')}>
          <Skeleton width='310px' height='33px' />
        </div>
        <div className={c('message')}>
          <Skeleton width='249px' height='33px' />
        </div>
        <div className={c('date')}>
          <div>
            <Skeleton width='100%' height='100%' />
          </div>
        </div>
        <div className={c('message', 'owner')}>
          <Skeleton width='206px' height='33px' />
        </div>
        <div className={c('message', 'owner')}>
          <Skeleton width='270px' height='33px' />
        </div>
        <div className={c('message', 'owner')}>
          <Skeleton width='520px' height='71px' />
        </div>
        <div className={c('message')}>
          <Skeleton width='270px' height='33px' />
        </div>
        <div className={c('message')}>
          <Skeleton width='142px' height='33px' />
        </div>
        <div className={c('message', 'owner')}>
          <Skeleton width='270px' height='33px' />
        </div>
        <div className={c('message', 'owner')}>
          <Skeleton width='520px' height='33px' />
        </div>
      </>
    );
  }
}

class ChatSkeleton3 extends React.PureComponent {
  render() {
    return (
      <>
        <div className={c('message', 'owner')}>
          <Skeleton width='270px' height='65px' />
        </div>
        <div className={c('message')}>
          <Skeleton width='270px' height='33px' />
        </div>
        <div className={c('message')}>
          <Skeleton width='520px' height='99px' />
        </div>
        <div className={c('message')}>
          <Skeleton width='270px' height='33px' />
        </div>
        <div className={c('date')}>
          <div>
            <Skeleton width='100%' height='100%' />
          </div>
        </div>
        <div className={c('message', 'owner')}>
          <Skeleton width='202px' height='33px' />
        </div>
        <div className={c('message', 'owner')}>
          <Skeleton width='310px' height='33px' />
        </div>
        <div className={c('message', 'owner')}>
          <Skeleton width='249px' height='33px' />
        </div>
        <div className={c('message')}>
          <Skeleton width='206px' height='33px' />
        </div>
        <div className={c('message')}>
          <Skeleton width='270px' height='33px' />
        </div>
        <div className={c('message')}>
          <Skeleton width='520px' height='135px' />
        </div>
        <div className={c('date')}>
          <div>
            <Skeleton width='100%' height='100%' />
          </div>
        </div>
        <div className={c('message', 'owner')}>
          <Skeleton width='270px' height='33px' />
        </div>
        <div className={c('message', 'owner')}>
          <Skeleton width='270px' height='33px' />
        </div>
        <div className={c('message')}>
          <Skeleton width='270px' height='33px' />
        </div>
        <div className={c('message')}>
          <Skeleton width='520px' height='33px' />
        </div>
        <div className={c('message', 'owner')}>
          <Skeleton width='206px' height='33px' />
        </div>
        <div className={c('message', 'owner')}>
          <Skeleton width='270px' height='33px' />
        </div>
      </>
    );
  }
}
