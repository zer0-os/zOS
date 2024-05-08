import * as React from 'react';

import { bemClassName } from '../../../lib/bem';

import { PanelHeader } from '../list/panel-header';
import { Image } from '@zero-tech/zui/components';
import { IconCurrencyEthereum } from '@zero-tech/zui/icons';

import './styles.scss';

const cn = bemClassName('user-profile');

export interface Properties {
  name: string;
  image: string;
  subHandle?: string;

  onBack: () => void;
}

export class UserProfile extends React.Component<Properties> {
  navigateBack = () => {
    this.props.onBack();
  };

  renderDetails = () => {
    return (
      <div {...cn('details')}>
        <div {...cn('image-conatiner')}>
          {this.props.image ? (
            <Image {...cn('image')} src={this.props.image} alt='Custom Profile Image' />
          ) : (
            <div {...cn('image')}>
              <IconCurrencyEthereum size={50} />
            </div>
          )}
        </div>

        <div {...cn('name-container')}>
          {<div {...cn('name')}>{this.props.name}</div>}
          {this.props.subHandle && <div {...cn('sub-handle')}>{this.props.subHandle}</div>}
        </div>
      </div>
    );
  };

  render() {
    return (
      <div {...cn()}>
        <div {...cn('header-container')}>
          <PanelHeader title={'Profile'} onBack={this.props.onBack} />
        </div>

        <div {...cn('body')}>{this.renderDetails()}</div>
      </div>
    );
  }
}
