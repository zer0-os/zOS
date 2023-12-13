import React, { useContext } from 'react';
import { Grid, SearchBar, SearchContext, SearchContextManager } from '@giphy/react-components';
import { config } from '../../../config';

import classNames from 'classnames';

import './styles.scss';

export interface ComponentProperties {
  onClickGif: Grid['props']['onGifClick'];
}

export const GiphyComponents = ({ onClickGif }: Properties) => {
  const { fetchGifs, searchKey } = useContext(SearchContext);
  return (
    <div className={classNames('giphy__container')}>
      <SearchBar className='giphy__container-search' autoFocus />
      <div className='giphy__container-grid'>
        <Grid
          key={searchKey}
          initialGifs={[]}
          columns={2}
          width={500}
          fetchGifs={fetchGifs}
          noLink
          onGifClick={onClickGif}
        />
      </div>
    </div>
  );
};

export interface Properties extends ComponentProperties {
  onClose: () => void;
}

export class Giphy extends React.Component<Properties> {
  componentDidMount = () => {
    document.addEventListener('mousedown', this.clickOutsideGiphyCheck);
  };

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.clickOutsideGiphyCheck);
  };

  clickOutsideGiphyCheck = (event: MouseEvent) => {
    const [giphy] = document.getElementsByClassName('giphy__container');

    if (giphy && event && event.target) {
      if (!giphy.contains(event.target as Node)) {
        this.props.onClose();
      }
    }
  };

  render = () => {
    return (
      <SearchContextManager apiKey={config.giphySdkKey}>
        <GiphyComponents {...this.props} />
      </SearchContextManager>
    );
  };
}
