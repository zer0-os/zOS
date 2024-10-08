import React, { RefObject } from 'react';

import { RootState } from '../../../../../store/reducer';
import { connectContainer } from '../../../../../store/redux-container';
import { AuthenticationState } from '../../../../../store/authentication/types';
import { ViewModes } from '../../../../../shared-components/theme-engine';

import { PostInput } from '.';

// should move this to a shared location
import { Media } from '../../../../message-input/utils';

export interface PublicProperties {
  id?: string;
  initialValue?: string;
  isSubmitting?: boolean;

  onSubmit: (message: string, media: Media[]) => void;
  onPostInputRendered?: (textareaRef: RefObject<HTMLTextAreaElement>) => void;
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
        initialValue={this.props.initialValue}
        isSubmitting={this.props.isSubmitting}
        onSubmit={this.props.onSubmit}
        onPostInputRendered={this.onPostInputRendered}
        avatarUrl={this.props.user.data?.profileSummary.profileImage}
        viewMode={this.props.viewMode}
      />
    );
  }
}

export const PostInputContainer = connectContainer<PublicProperties>(Container);
