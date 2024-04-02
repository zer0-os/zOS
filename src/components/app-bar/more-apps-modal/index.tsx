import * as React from 'react';
import { Modal } from '../../modal';

import { bemClassName } from '../../../lib/bem';
import './styles.scss';
import {
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

export interface Properties {
  onClose: () => void;
}

export class MoreAppsModal extends React.Component<Properties> {
  close = () => {
    this.props.onClose();
  };

  link(url: string, text: string) {
    return (
      <a {...cn('link')} href={url} target='_blank' rel='noopener noreferrer'>
        {text}
      </a>
    );
  }

  render() {
    return (
      <Modal title='Explore ZERO Apps' onClose={this.close}>
        <div {...cn()}>
          <div {...cn('header')}>Explore ZERO's suite of dApps, soon to be unified into the ZERO Operating System:</div>
          <div {...cn('app-list')}>
            <div {...cn('app-column')}>
              <App
                Icon={IconCompass3}
                name='Explorer'
                description='Browse & mint ZERO IDs'
                footer={this.link('https://explorer.zero.tech/', 'View app↗')}
              />
              <App
                Icon={IconWallet5}
                name='Airdrop'
                description='Join to earn MEOW'
                footer={this.link('https://leaderboard.zero.tech/', 'View app↗')}
              />
              <App
                Icon={IconMap1}
                name='Vote'
                description='Proposals & governance'
                footer={
                  <div>
                    View {this.link('https://app.wilderworld.com/0.wilder/daos', 'Wilder↗')} and{' '}
                    {this.link('https://dao.meow.inc/assets', 'MEOW↗')} DAOs
                  </div>
                }
              />
            </div>
            <div {...cn('app-column')}>
              <App
                Icon={IconCoinsSwap1}
                name='Trade'
                description='Buy & sell NFTs'
                footer={<div>View {this.link('https://app.wilderworld.com/market', 'Wilder Marketplace↗')}</div>}
              />
              <App
                Icon={IconSafe}
                name='Stake'
                description='Deposit and earn'
                footer={<div>View {this.link('https://app.wilderworld.com/staking/pools', 'Wilder Staking↗')}</div>}
              />
              <App
                Icon={IconRss1}
                name='Posts'
                description='Decentralized social'
                footer={<div>View posts on {this.link('https://explorer.zero.tech/', 'Explorer↗')}</div>}
              />
            </div>
          </div>
          <div {...cn('app-actions')}>
            <App
              Icon={IconCode2}
              name='Create'
              description='Build an app on ZERO'
              isSecondary
              footer={
                <div>
                  Coming Soon. Join {this.link('https://t.me/welcometozero', 'Telegram↗')} &{' '}
                  {this.link('https://twitter.com/zero__tech', 'X↗')}
                </div>
              }
            />
            <App
              Icon={IconBox}
              name='RequestApp'
              description='What do you want to do on ZERO?'
              isSecondary
              footer={<div>Tell us about it on {this.link('https://t.me/welcometozero', 'Telegram↗')}</div>}
            />
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
  isSecondary?: boolean;
  footer: JSX.Element;
}

class App extends React.PureComponent<AppProperties> {
  render() {
    return (
      <div {...cn('app-card', this.props.isSecondary && 'secondary')}>
        <div {...cn('icon')}>
          <this.props.Icon size={'24px'} />
        </div>
        <div>
          <div {...cn('app-name')}>{this.props.name}</div>
          <div {...cn('app-description')}>{this.props.description}</div>
          <div {...cn('app-footer')}>{this.props.footer}</div>
        </div>
      </div>
    );
  }
}
