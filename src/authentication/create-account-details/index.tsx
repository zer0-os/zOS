import * as React from 'react';

import { Alert, Button, Input } from '@zero-tech/zui/components';

import './styles.scss';
import { bem } from '../../lib/bem';
import { ImageUpload } from '../../components/image-upload';
import { IconUpload2 } from '@zero-tech/zui/icons';

const c = bem('create-account-details');

export interface Properties {
  isLoading: boolean;
  errors: {
    image?: string;
    name?: string;
    general?: string;
  };

  onCreate: (data: { name: string; image: File | null }) => void;
}

interface State {
  name: string;
  image: File | null;
}

export class CreateAccountDetails extends React.Component<Properties, State> {
  state = { name: '', image: null };

  publishOnCreate = (e) => {
    e.preventDefault();
    this.props.onCreate({ name: this.state.name, image: this.state.image });
  };

  trackName = (value) => this.setState({ name: value });
  trackImage = (image) => this.setState({ image });

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
  get imageError() {
    return this.props.errors.image;
  }

  renderImageUploadIcon = (): JSX.Element => <IconUpload2 isFilled size={24} color='#EDEDEF' />;

  render() {
    return (
      <div className={c('')}>
        <h3 className={c('heading')}>CREATE YOUR ACCOUNT</h3>
        <div className={c('sub-heading')}>Step 2 of 2: What should we call you?</div>
        <form className={c('form')} onSubmit={this.publishOnCreate}>
          <div className={c('image-upload')}>
            <ImageUpload
              onChange={this.trackImage}
              icon={this.renderImageUploadIcon()}
              uploadText='Select or drag and drop'
            />
          </div>
          {this.imageError && <Alert variant='error'>{this.imageError}</Alert>}
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
          <Button isLoading={this.props.isLoading} isSubmit>
            Create Account
          </Button>
        </form>
      </div>
    );
  }
}
