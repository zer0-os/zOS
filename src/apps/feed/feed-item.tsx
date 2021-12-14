import React from 'react';

import './styles.css';

export interface Model {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface Properties extends Model {
}

export class FeedItem extends React.Component<Properties> {
  render() {
    const { title, description, imageUrl } = this.props;
    return (
      <div className="feed-item">
        {imageUrl && <img className="feed-item__image" src={this.props.imageUrl} />}
        <div className='feed-item__text-content'>
          <h3 className="feed-item__title">{title}</h3>
          <span className="feed-item__description">{description}</span>
        </div>
      </div>
    );
  }
}
