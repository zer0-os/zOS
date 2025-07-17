import * as React from 'react';

import { bemClassName } from '../../../../../lib/bem';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { IconCoinsStacked2, IconChevronRight } from '@zero-tech/zui/icons';

import './styles.scss';

const cn = bemClassName('rewards-item');

export interface Properties {
  totalUSD: string;
  totalMeow: string;
  isLoading?: boolean;
  error?: string;

  onClaimEarnings?: () => void;
}

export class RewardsItem extends React.Component<Properties> {
  handleClaimClick = () => {
    if (this.props.onClaimEarnings) {
      this.props.onClaimEarnings();
    }
  };

  render() {
    return (
      <div {...cn()}>
        <div {...cn('header')}>
          <div {...cn('title')}>Earnings</div>
          <IconChevronRight {...cn('chevron')} size={18} isFilled />
        </div>

        <div {...cn('info-container')}>
          <div {...cn('usd')}>{this.props.totalUSD}</div>

          <div {...cn('claim-button-container')}>
            <Button
              {...cn('claim-button')}
              variant={ButtonVariant.Secondary}
              onPress={this.handleClaimClick}
              isLoading={this.props.isLoading}
              startEnhancer={<IconCoinsStacked2 {...cn('claim-button-icon')} size={16} />}
            >
              Claim Earnings
            </Button>

            {this.props.error && <div {...cn('error-message')}>{this.props.error}</div>}
          </div>
        </div>
      </div>
    );
  }
}
