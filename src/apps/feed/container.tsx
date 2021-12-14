import React from 'react';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';

import { Feed } from '.';
import { Model as FeedItem } from './feed-item';
import { load } from '../../store/feed';

export interface Properties {
  route: string;
  items: FeedItem[];
  load: (route: string) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    return {
      items: state.feed.value,
      route: state.zns.value.route,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { load };
  }

  componentDidMount() {
    this.props.load(this.props.route);
  }

  render() {
    return <Feed items={this.props.items} />;
  }
}

export const FeedContainer = connectContainer<{}>(Container);
