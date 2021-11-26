import React from 'react';

import './styles.css';

export interface Model {
  id: string;
  title: string;
  description: string;
}

export interface Properties extends Model {
}

export class FeedItem extends React.Component<Properties> {
  render() {
    return (
      <div className="feed-item">
        <span className="feed-item__title">{this.props.title}</span>
        <span className="feed-item__description">{this.props.description}</span>
      </div>
    );
  }
}
