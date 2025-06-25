import * as React from 'react';

import { Option } from '../../lib/types';
import { highlightFilter } from '../../lib/utils';
import { Waypoint } from '../../../waypoint';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';
import { MatrixAvatar } from '../../../matrix-avatar';
import { IconZeroProVerified } from '@zero-tech/zui/icons';

import { bemClassName } from '../../../../lib/bem';
import './user-search-results.scss';
import '../styles.scss';
const cn = bemClassName('user-search-results');

const PAGE_SIZE = 20;

export interface Properties {
  filter: string;
  results: Option[];
  onCreate: (userId: string) => void;
}

interface State {
  visibleResultCount: number;
  isLoadingMore: boolean;
}

export class UserSearchResults extends React.Component<Properties, State> {
  state: State = {
    visibleResultCount: PAGE_SIZE,
    isLoadingMore: false,
  };

  componentDidUpdate(prevProps: Properties) {
    // Reset pagination when search filter changes
    if (prevProps.filter !== this.props.filter) {
      this.setState({ visibleResultCount: PAGE_SIZE });
    }
  }

  loadMoreResults = () => {
    const { visibleResultCount } = this.state;
    const { results } = this.props;
    const totalMembers = results.length;

    // Don't load more if we've already loaded all members or if we're already loading
    if (visibleResultCount >= totalMembers || this.state.isLoadingMore) return;

    this.setState({ isLoadingMore: true }, () => {
      requestAnimationFrame(() => {
        this.setState({
          visibleResultCount: Math.min(visibleResultCount + PAGE_SIZE, totalMembers),
          isLoadingMore: false,
        });
      });
    });
  };

  handleUserClick = (id: string) => {
    this.props.onCreate(id);
  };

  handleKeyDown = (id: string) => (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      this.props.onCreate(id);
    }
  };

  render() {
    const { filter, results } = this.props;
    const { visibleResultCount, isLoadingMore } = this.state;
    const visibleResults = results.slice(0, visibleResultCount);
    const hasMoreResults = visibleResults.length < results.length;

    return (
      <div {...cn()}>
        <div {...cn('title')}>Start a new conversation:</div>
        {visibleResults.map((userResult) => (
          <div
            {...cn('item')}
            tabIndex={0}
            role='button'
            onKeyDown={this.handleKeyDown(userResult.value)}
            onClick={() => this.handleUserClick(userResult.value)}
            key={userResult.value}
          >
            <MatrixAvatar size='regular' imageURL={userResult.image} tabIndex={-1} />

            <div {...cn('user-details')}>
              <div {...cn('label-container')}>
                <div {...cn('label')}>{highlightFilter(userResult.label, filter)}</div>
                {userResult.isZeroProSubscriber && <IconZeroProVerified size={16} />}
              </div>
              {userResult?.subLabel && <div {...cn('sub-label')}>{userResult.subLabel}</div>}
            </div>
          </div>
        ))}

        {hasMoreResults && (
          <div {...cn('waypoint-container')}>
            <Waypoint onEnter={this.loadMoreResults} />
          </div>
        )}

        {isLoadingMore && (
          <div {...cn('loading-more')}>
            <Spinner />
          </div>
        )}
      </div>
    );
  }
}
