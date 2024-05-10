import React, { useContext } from 'react';
import { Grid, SearchBar, SearchContext, SearchContextManager } from '@giphy/react-components';
import { config } from '../../../config';

import { bemClassName } from '../../../lib/bem';

import './styles.scss';

const cn = bemClassName('giphy');

export interface ComponentProperties {
  onClickGif: Grid['props']['onGifClick'];
}

export const GiphyComponents = ({ onClickGif }: Properties) => {
  const { fetchGifs, searchKey } = useContext(SearchContext);

  const renderNoResults = <div {...cn('no-results')}>No results found</div>;

  return (
    <div {...cn('')}>
      <SearchBar {...cn('search')} autoFocus />
      <div {...cn('grid')}>
        <Grid
          key={searchKey}
          initialGifs={[]}
          columns={2}
          width={510}
          fetchGifs={fetchGifs}
          noLink
          onGifClick={onClickGif}
          noResultsMessage={renderNoResults}
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
    const [giphy] = document.getElementsByClassName('giphy');

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
