import React, { RefObject } from 'react';

import { RootState } from '../../../../store/reducer';
import { connectContainer } from '../../../../store/redux-container';
import { AuthenticationState } from '../../../../store/authentication/types';
import { ViewModes } from '../../../../shared-components/theme-engine';

import { PostInput } from '.';

export interface PublicProperties {
  id?: string;
  initialValue?: string;
  className?: string;
  variant?: 'comment' | 'post';

  onSubmit: (message: string, mediaId?: string) => void;
}

export interface Properties extends PublicProperties {
  user: AuthenticationState['user'];
  viewMode: ViewModes;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      authentication: { user },
      theme: {
        value: { viewMode },
      },
    } = state;

    return { user, viewMode };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  onPostInputRendered = (textareaRef: RefObject<HTMLTextAreaElement>) => {
    const activeConversationId = this.props.id;
    if (textareaRef && textareaRef.current) {
      if ((activeConversationId && activeConversationId === textareaRef.current.id) || !activeConversationId) {
        textareaRef.current.focus();
      }
    }
  };

  render() {
    return (
      <PostInput
        id={this.props.id}
        className={this.props.className}
        initialValue={this.props.initialValue}
        onSubmit={this.props.onSubmit}
        onPostInputRendered={this.onPostInputRendered}
        avatarUrl={this.props.user.data?.profileSummary.profileImage}
        viewMode={this.props.viewMode}
        variant={this.props.variant ?? 'post'}
      />
    );
  }
}

export const PostInputContainer = connectContainer<PublicProperties>(Container);
