import React from 'react';
import { FeedItem, Model as FeedItemModel } from './feed-item';

import './styles.css';

export interface Properties {
  items: FeedItemModel[];
}

export class Feed extends React.Component<Properties> {
  renderItems() {
    return this.props.items.map(item => <FeedItem key={item.id} {...item} />);
  }

  render() {
    return (
      <div className="feed">
        <div className="feed__items">
          {this.renderItems()}
        </div>
      </div>
    );
  }
}
