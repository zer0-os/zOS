import * as React from 'react';
import { Modal } from '../../modal';

import { bemClassName } from '../../../lib/bem';
import './styles.scss';
import { Alert, Input } from '@zero-tech/zui/components';
import { IconLock1 } from '@zero-tech/zui/icons';
import { State as UserFeedbackState } from '../../../store/user-feedback';

const cn = bemClassName('user-feedback-modal');

export interface Properties {
  state: UserFeedbackState;
  errorMessage: string;

  onClose: () => void;
  onSubmit: ({ feedback }: { feedback: string }) => void;
}

interface State {
  feedbackText: string;
}

export class UserFeedbackModal extends React.Component<Properties, State> {
  state = { feedbackText: '' };

  close = () => {
    this.props.onClose();
  };

  addFeedback = (value) => {
    this.setState({ feedbackText: value });
  };

  isPrimaryDisabled = () => {
    return this.state.feedbackText === '' || this.state.feedbackText.length > 1000;
  };

  submitFeedback = () => {
    this.props.onSubmit({ feedback: this.state.feedbackText });
  };

  get changesSaved() {
    return this.props.state === UserFeedbackState.SUCCESS;
  }

  render() {
    return (
      <Modal
        title='Submit Feedback'
        onClose={this.close}
        primaryText='Submit'
        primaryDisabled={this.isPrimaryDisabled()}
        onPrimary={this.submitFeedback}
        isProcessing={this.props.state === UserFeedbackState.INPROGRESS}
        secondaryText='Cancel'
        secondaryDisabled={false}
        onSecondary={this.close}
      >
        <div {...cn()}>
          <p {...cn('primary-text')}>Share your feedback</p>

          <p {...cn('secondary-text')}>
            Please describe your issue or feature request with as much detail as possible, including steps that we can
            take to reproduce any issues you’ve encountered.
          </p>

          <Input
            className='user-feedback-modal__input-container'
            onChange={this.addFeedback}
            value={this.state.feedbackText}
          />

          {this.props.errorMessage && (
            <Alert {...cn('error-alert')} variant='error'>
              {this.props.errorMessage}
            </Alert>
          )}

          {this.changesSaved && (
            <Alert {...cn('success-alert')} variant='success'>
              Thanks, we've received your feedback
            </Alert>
          )}

          <div {...cn('message-alert')}>
            <IconLock1 isFilled size={16} />
            <span {...cn('message-alert-text')}>Your feedback is anonymous</span>
          </div>
        </div>
      </Modal>
    );
  }
}
