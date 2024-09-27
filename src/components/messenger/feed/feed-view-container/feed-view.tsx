import React, { ReactNode } from 'react';
import { Waypoint } from 'react-waypoint';

import { Posts } from '../components/posts';
import { MessagesFetchState } from '../../../../store/channels';
import { Media, Message as MessageModel } from '../../../../store/messages';
import { Payload as PayloadFetchPosts } from '../../../../store/posts/saga';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';

import { bemClassName } from '../../../../lib/bem';
import './styles.scss';

const cn = bemClassName('feed-view');

export interface Properties {
  currentUserId: string;
  postMessages: MessageModel[];
  hasLoadedMessages: boolean;
  messagesFetchStatus: MessagesFetchState;
  userMeowBalance: string;

  fetchPosts: (payload: PayloadFetchPosts) => void;
  onFetchMore: () => void;
  loadAttachmentDetails: (payload: { media: Media; messageId: string }) => void;
  transferMeow: (postOwnerId, postMessageId, meowAmount) => void;
}

export class FeedView extends React.Component<Properties> {
  contentRef: React.RefObject<HTMLDivElement>;

  state = {
    shouldRenderWaypoint: false,
  };

  constructor(props: Properties) {
    super(props);
    this.contentRef = React.createRef();
  }

  componentDidMount() {
    this.checkContentHeight();
  }

  componentDidUpdate(prevProps: Properties) {
    if (
      prevProps.postMessages !== this.props.postMessages ||
      prevProps.hasLoadedMessages !== this.props.hasLoadedMessages
    ) {
      this.checkContentHeight();
    }
  }

  checkContentHeight() {
    if (this.contentRef.current) {
      const contentHeight = this.contentRef.current.clientHeight;
      const viewportHeight = window.innerHeight;

      this.setState({
        shouldRenderWaypoint: contentHeight > viewportHeight,
      });
    }
  }

  render() {
    return (
      <div {...cn('')} ref={this.contentRef}>
        {this.props.hasLoadedMessages && (
          <>
            {this.props.postMessages.length > 0 ? (
              <>
                <Posts
                  currentUserId={this.props.currentUserId}
                  postMessages={this.props.postMessages}
                  loadAttachmentDetails={this.props.loadAttachmentDetails}
                  transferMeow={this.props.transferMeow}
                  userMeowBalance={this.props.userMeowBalance}
                />

                {this.props.messagesFetchStatus === MessagesFetchState.SUCCESS && this.state.shouldRenderWaypoint && (
                  <div {...cn('waypoint')}>
                    <Waypoint onEnter={this.props.onFetchMore} />
                  </div>
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
