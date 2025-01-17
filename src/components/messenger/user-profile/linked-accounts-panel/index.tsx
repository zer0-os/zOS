import * as React from 'react';

import { bemClassName } from '../../../../lib/bem';

import { PanelHeader } from '../../list/panel-header';
import { IconLink1 } from '@zero-tech/zui/icons';
import { ScrollbarContainer } from '../../../scrollbar-container';

import './styles.scss';

const cn = bemClassName('linked-accounts-panel');

export interface Properties {
  onBack: () => void;
  onTelegramLink: () => void;
}

export class LinkedAccountsPanel extends React.Component<Properties> {
  back = () => {
    this.props.onBack();
  };

  telegramLink = () => {
    this.props.onTelegramLink();
  };

  render() {
    return (
      <div {...cn()}>
        <div {...cn('header-container')}>
          <PanelHeader title={'Linked Accounts'} onBack={this.back} />
        </div>

        <ScrollbarContainer variant='on-hover'>
          <div {...cn('body')}>
            <div>
              <div {...cn('section-header')} onClick={this.telegramLink}>
                <IconLink1 {...cn('section-icon')} size={24} />
                <h4 {...cn('section-title')}>Telegram</h4>
              </div>
            </div>
          </div>
        </ScrollbarContainer>
      </div>
    );
  }
}
