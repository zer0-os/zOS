import * as React from 'react';
import { RootState } from '../../../store/reducer';

import { State, submitFeedback } from '../../../store/user-feedback';
import { UserFeedbackModal } from '.';
import { connectContainer } from '../../../store/redux-container';

export interface PublicProperties {
  onClose: () => void;
}

export interface Properties extends PublicProperties {
  userFeedbackState: State;
  error: string;

  submitFeedback: ({ feedback }: { feedback: string }) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState, _props: PublicProperties): Partial<Properties> {
    return {
      userFeedbackState: state.userFeedback.state,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { submitFeedback };
  }

  render() {
    return (
      <UserFeedbackModal
        onSubmit={this.props.submitFeedback}
        onClose={this.props.onClose}
        state={this.props.userFeedbackState}
        errorMessage={'An error occurred. Please try again.'}
      />
    );
  }
}

export const UserFeedbackContainer = connectContainer<PublicProperties>(Container);
