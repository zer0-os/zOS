import * as React from 'react';

import { ImageUpload } from '../../components/image-upload';
import { IconImagePlus } from '@zero-tech/zui/icons';
import { Alert, Button, Input } from '@zero-tech/zui/components';

import { bem, bemClassName } from '../../lib/bem';
import './styles.scss';

const c = bem('create-account-details');
const cn = bemClassName('create-account-details');

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

  renderImageUploadIcon = (): JSX.Element => <IconImagePlus />;

  render() {
    return (
      <div {...cn('')}>
        <div {...cn('heading-container')}>
          <h3 {...cn('heading')}>Create Account</h3>
          <div {...cn('sub-heading')}>Enter your details</div>
        </div>
        <form {...cn('form')} onSubmit={this.publishOnCreate}>
          <div {...cn('image-upload')}>
            <ImageUpload
              onChange={this.trackImage}
              icon={this.renderImageUploadIcon()}
              isError={Boolean(this.props.errors.image)}
              errorMessage={this.props.errors.image}
            />
          </div>
          {this.imageError && (
            <Alert isFilled variant='error'>
              {this.imageError}
            </Alert>
          )}
          <Input
            {...cn('input')}
            label='Display Name'
            wrapperClassName={c('input-wrapper')}
            helperTextClassName={c('input-helper-text')}
            helperText='This is the name that is visible to others on ZERO'
            placeholder='E.g John Smith'
            name='name'
            value={this.state.name}
            onChange={this.trackName}
            error={!!this.nameError}
            alert={this.nameError}
          />
          {this.generalError && (
            <Alert isFilled variant='error'>
              {this.generalError}
            </Alert>
          )}
          <Button {...cn('submit-button')} isLoading={this.props.isLoading} isSubmit>
            Create Account
          </Button>
        </form>
      </div>
    );
  }
}
