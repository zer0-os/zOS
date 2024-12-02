import * as React from 'react';

import { Alert, IconButton, Input, Modal, SelectInput } from '@zero-tech/zui/components';
import { Button, Variant as ButtonVariant, Color as ButtonColor } from '@zero-tech/zui/components/Button';

import { IconXClose } from '@zero-tech/zui/icons';

import { bem, bemClassName } from '../../lib/bem';
import './styles.scss';
import { ReportUserPayload } from '../../store/report-user';

const c = bem('report-user-dialog');
const cn = bemClassName('report-user-dialog');

export interface Properties {
  reportedUserName: string;
  loading: boolean;
  errorMessage: string;
  successMessage: string;

  onReport: (payload: ReportUserPayload) => void;
  onClose: () => void;
}

interface State {
  selectedReason: string;
  additionalComments: string;
}

export class ReportUserModal extends React.Component<Properties, State> {
  state = {
    selectedReason: '',
    additionalComments: '',
  };

  close = () => {
    this.props.onClose();
  };

  report = () => {
    this.props.onReport({
      reason: this.state.selectedReason,
      comment: this.state.additionalComments,
    });
  };

  handleReasonChange = (reason) => {
    this.setState({ selectedReason: reason });
  };

  handleAdditionalCommentsChange = (comment) => {
    this.setState({ additionalComments: comment });
  };

  get reasonOptions() {
    return [
      {
        id: 'bot',
        label: 'Seems like a bot',
        onSelect: () => this.handleReasonChange('Seems like a bot'),
      },
      {
        id: 'inappropriate',
        label: 'Inappropriate Behaviour',
        onSelect: () => this.handleReasonChange('Inappropriate Behaviour'),
      },
      { id: 'spam', label: 'Spam', onSelect: () => this.handleReasonChange('Spam') },
    ];
  }

  render() {
    return (
      <Modal {...cn('')} open>
        <div {...cn('header')}>
          <h2>Report User</h2>
          <IconButton Icon={IconXClose} size='large' onClick={this.close} />
        </div>
        <div {...cn('text-content')}>
          Are you sure you want to report user{' '}
          <b>
            <i>{this.props.reportedUserName}</i>
          </b>{' '}
          ? This action will be reviewed.
        </div>
        <div {...cn('select-reason')}>
          <div {...cn('label-text')}>Please select a reason</div>
          <SelectInput
            items={this.reasonOptions}
            label=''
            placeholder='Select a reason (required)'
            value={this.state.selectedReason}
            itemSize='spacious'
            menuClassName={c('reason-select-menu')}
          />
        </div>

        <div {...cn('additional-comments')}>
          <div {...cn('label-text')}>Any addtional comments?</div>
          <Input
            className={c('additional-comments-input')}
            placeholder='Addtional comments (optional)'
            value={this.state.additionalComments}
            onChange={this.handleAdditionalCommentsChange}
          />

          {this.props.errorMessage && (
            <Alert className={c('alert-small')} variant='error'>
              <div className={c('alert-text')}>{this.props.errorMessage}</div>
            </Alert>
          )}

          {this.props.successMessage && (
            <Alert className={c('alert-small')} variant='success'>
              <div className={c('alert-text')}>{this.props.successMessage}</div>
            </Alert>
          )}
        </div>

        <div {...cn('footer')}>
          <Button variant={ButtonVariant.Secondary} color={ButtonColor.Greyscale} onPress={this.close}>
            Cancel
          </Button>

          <Button
            color={ButtonColor.Red}
            isLoading={this.props.loading}
            onPress={this.report}
            isDisabled={!this.state.selectedReason}
          >
            Report User
          </Button>
        </div>
      </Modal>
    );
  }
}
