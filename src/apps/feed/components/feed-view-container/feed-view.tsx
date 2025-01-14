import React, { ReactNode } from 'react';
import { Waypoint } from 'react-waypoint';

import { Posts } from '../posts';
import { MessagesFetchState } from '../../../../store/channels';
import { Media, Message as MessageModel } from '../../../../store/messages';
import { Payload as PayloadFetchPosts } from '../../../../store/posts/saga';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';
import { LoadMoreButton } from '../load-more';

import { bemClassName } from '../../../../lib/bem';
import './styles.scss';
import { FeatureFlag } from '../../../../components/feature-flag';

const cn = bemClassName('feed-view');

export interface Properties {
  currentUserId: string;
  postMessages: MessageModel[];
  hasLoadedMessages: boolean;
  messagesFetchStatus: MessagesFetchState;
  userMeowBalance: string;
  channelId?: string;
  fetchPosts: (payload: PayloadFetchPosts) => void;
  onFetchMore: () => void;
  loadAttachmentDetails: (payload: { media: Media; messageId: string }) => void;
  meowPost: (postId: string, meowAmount: string) => void;
}

export class FeedView extends React.Component<Properties> {
  render() {
    return (
      <div {...cn('')}>
        {this.props.channelId && (
          <FeatureFlag featureFlag='enableLoadMore'>
            <LoadMoreButton channelId={this.props.channelId} />
          </FeatureFlag>
        )}
        {this.props.hasLoadedMessages && (
          <>
            {this.props.postMessages.length > 0 ? (
              <>
                <Posts
                  currentUserId={this.props.currentUserId}
                  postMessages={this.props.postMessages}
                  loadAttachmentDetails={this.props.loadAttachmentDetails}
                  userMeowBalance={this.props.userMeowBalance}
                  meowPost={this.props.meowPost}
                />

                {this.props.messagesFetchStatus === MessagesFetchState.SUCCESS && (
                  <Waypoint onEnter={this.props.onFetchMore} />
                )}
              </>
            ) : (
              <Message>Nobody has posted here yet</Message>
            )}
          </>
        )}

        {(!this.props.hasLoadedMessages || this.props.messagesFetchStatus === MessagesFetchState.MORE_IN_PROGRESS) && (
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
