import React, { ReactNode } from 'react';
import { Waypoint } from 'react-waypoint';

import { Posts } from '../components/posts';
import { MessagesFetchState } from '../../../../store/channels';
import { Message as MessageModel } from '../../../../store/messages';
import { Payload as PayloadFetchPosts } from '../../../../store/posts/saga';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';

import { bemClassName } from '../../../../lib/bem';
import './styles.scss';

const cn = bemClassName('feed-view');

export interface Properties {
  postMessages: MessageModel[];
  hasLoadedMessages: boolean;
  messagesFetchStatus: MessagesFetchState;

  fetchPosts: (payload: PayloadFetchPosts) => void;
  onFetchMore: () => void;
}

export class FeedView extends React.Component<Properties> {
  render() {
    return (
      <div {...cn('')}>
        {this.props.hasLoadedMessages && (
          <>
            {this.props.postMessages.length > 0 ? (
              <>
                <Posts postMessages={this.props.postMessages} />

                {this.props.messagesFetchStatus === MessagesFetchState.SUCCESS && (
                  <Waypoint onEnter={this.props.onFetchMore} />
                )}
              </>
            ) : (
              <Message>Nobody has posted here yet</Message>
            )}
          </>
        )}

        {!this.props.hasLoadedMessages && (
          <Message>
            <Spinner />
          </Message>
        )}
      </div>
    );
  }
}

export const Message = ({ children }: { children: ReactNode }) => {
  return <div {...cn('message')}>{children}</div>;
};
