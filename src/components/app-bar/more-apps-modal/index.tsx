import * as React from 'react';
import { Modal } from '../../modal';

import { bemClassName } from '../../../lib/bem';
import './styles.scss';
import {
  IconActivityHeart,
  IconBox,
  IconCode2,
  IconCoinsSwap1,
  IconCompass3,
  IconMap1,
  IconRss1,
  IconSafe,
  IconWallet5,
} from '@zero-tech/zui/icons';
import { IconProps } from '@zero-tech/zui/components/Icons/Icons.types';

const cn = bemClassName('more-apps-modal');

export interface Properties {}

export class MoreAppsModal extends React.Component<Properties> {
  close = () => {};
  render() {
    return (
      <Modal title='Explore ZERO Apps' onClose={this.close}>
        <div {...cn()}>
          <div {...cn('header')}>Explore ZERO's suite of dApps, soon to be unified into the ZERO Operating System:</div>
          <div {...cn('app-list')}>
            <div {...cn('app-column')}>
              <App Icon={IconCompass3} name='Explorer' description='Browse & mint ZERO IDs' />
              <App Icon={IconWallet5} name='Airdrop' description='Join to earn MEOW' />
              <App Icon={IconMap1} name='Vote' description='Proposals & governance' />
            </div>
            <div {...cn('app-column')}>
              <App Icon={IconCoinsSwap1} name='Trade' description='Buy & sell NFTs' />
              <App Icon={IconSafe} name='Stake' description='Deposit and earn' />
              <App Icon={IconRss1} name='Posts' description='Decentralized social' />
            </div>
          </div>
          <div {...cn('app-actions')}>
            <App Icon={IconCode2} name='Create' description='Build an app on ZERO' />
            <App Icon={IconBox} name='RequestApp' description='What do you want to do on ZERO?' />
          </div>
        </div>
      </Modal>
    );
  }
}

interface AppProperties {
  Icon: React.JSXElementConstructor<IconProps>;
  name: string;
  description: string;
}

class App extends React.PureComponent<AppProperties> {
  render() {
    return (
      <div {...cn('app-card')}>
        <div {...cn('icon')}>
          <this.props.Icon size={'24px'} />
        </div>
        <div>
          <div {...cn('app-name')}>{this.props.name}</div>
          <div {...cn('app-description')}>{this.props.description}</div>
          <div {...cn('app-link')}>View app ↗</div>
        </div>
      </div>
    );
  }
}
