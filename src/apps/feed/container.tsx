import React from 'react';
import { RootState } from '../../app/store';
import { connectContainer } from '../../app/store/redux-container';

import { Feed } from '.';
import { Model as FeedItem } from './feed-item';

export interface Properties {
  items: FeedItem[];
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    return {
      items: state.feed.value,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  render() {
    return <Feed items={this.props.items} />;
  }
}

export const FeedContainer = connectContainer<{}>(Container);
