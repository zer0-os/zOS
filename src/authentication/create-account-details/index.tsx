import * as React from 'react';

import { Alert, Button, Input } from '@zero-tech/zui/components';

import './styles.scss';
import { bem } from '../../lib/bem';
const c = bem('create-account-details');

export interface Properties {
  isLoading: boolean;
  errors: {
    name?: string;
    general?: string;
  };

  onCreate: (data: { name: string }) => void;
}

interface State {
  name: string;
}

export class CreateAccountDetails extends React.Component<Properties, State> {
  state = { name: '' };

  publishOnCreate = (e) => {
    e.preventDefault();
    this.props.onCreate({ name: this.state.name });
  };

  trackName = (value) => this.setState({ name: value });

  get isValid() {
    return this.state.name.trim().length > 0;
  }

  get nameError() {
    if (this.props.errors.name) {
      return { variant: 'error', text: this.props.errors.name } as any;
    }
    return null;
  }

  get generalError() {
    return this.props.errors.general;
  }

  render() {
    return (
      <div className={c('')}>
        <h3 className={c('heading')}>CREATE YOUR ACCOUNT</h3>
        <div className={c('sub-heading')}>Step 2 of 2: What should we call you?</div>
        <form className={c('form')} onSubmit={this.publishOnCreate}>
          <Input
            label='What is your name?'
            helperText='This will be your name that is visible to others on Zero'
            name='name'
            value={this.state.name}
            onChange={this.trackName}
            error={!!this.nameError}
            alert={this.nameError}
          />
          {this.generalError && <Alert variant='error'>{this.generalError}</Alert>}
          <Button className={c('button')} isLoading={this.props.isLoading} isSubmit>
            Create Account
          </Button>
        </form>
      </div>
    );
  }
}
