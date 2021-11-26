import React from 'react';

import './styles.css';

export interface Model {
  id: string;
  title: string;
  description: string;
}

export interface Properties {
  items: Model[];
}

export class FeedItem extends React.Component {
  render() {
    return (
      <div className="feed-item">
      </div>
    );
  }
}
