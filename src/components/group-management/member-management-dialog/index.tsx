import * as React from 'react';

import { Alert, ModalConfirmation } from '@zero-tech/zui/components';

import './styles.scss';

import { bemClassName } from '../../../lib/bem';

const cn = bemClassName('member-management-dialog');

export interface Properties {
  inProgress: boolean;
  error: string;
  definition: ConfirmationDefinition;

  onClose: () => void;
  onConfirm: () => void;
}

export interface ConfirmationDefinition {
  getProgressMessage(): string;
  getTitle(): string;
  getMessage(): JSX.Element;
}

export class MemberManagementDialog extends React.Component<Properties> {
  render() {
    return (
      <ModalConfirmation
        open
        title={this.props.definition.getTitle()}
        cancelLabel='Cancel'
        confirmationLabel={this.props.definition.getTitle()}
        onCancel={this.props.onClose}
        onConfirm={this.props.onConfirm}
        inProgress={this.props.inProgress}
      >
        <div {...cn()}>
          <div>
            {this.props.inProgress ? this.props.definition.getProgressMessage() : this.props.definition.getMessage()}
          </div>
          {this.props.error && (
            <Alert variant='error' isFilled>
              {this.props.error}
            </Alert>
          )}
        </div>
      </ModalConfirmation>
    );
  }
}
