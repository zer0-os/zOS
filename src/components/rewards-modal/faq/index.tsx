import * as React from 'react';

import { Accordion } from '@zero-tech/zui/components';
import { IconArrowLeft } from '@zero-tech/zui/icons';
import { bemClassName } from '../../../lib/bem';

import './styles.scss';

const cn = bemClassName('rewards-modal-faq');

export interface Properties {
  onBack: () => void;
}

export class Faq extends React.Component<Properties> {
  back = (): void => {
    this.props.onBack();
  };

  link(url: string, text: string) {
    return (
      <a {...cn('link')} href={url} target='_blank' rel='noopener noreferrer'>
        {text}
      </a>
    );
  }

  get explorerUrl() {
    return 'https://explorer.zero.tech/';
  }

  get uniswapUrl() {
    return 'https://app.uniswap.org/swap?outputCurrency=0x0eC78ED49C2D27b315D462d43B5BAB94d2C79bf8&inputCurrency=ETH&use=V2';
  }

  get meowUrl() {
    return 'https://www.meow.inc/';
  }

  get backupFAQContent() {
    return [
      {
        title: 'How do I earn daily income?',
        content: (
          <div>
            <p>
              ZERO Messenger rewards all active users by distributing rewards from a daily pool. The criteria that
              determine daily ZBI payments include:
            </p>
            <ol>
              <li>Messaging - Having conversations in the app contributes to your daily allotment.</li>
              <li>Invites - Inviting friends who sign up and join the app gives you a ZBI bump.</li>
              <li>
                Refer-a-Mint - Inviting friends who join Messenger and then go on to{' '}
                {this.link(this.explorerUrl, 'mint a ZERO ID')} will earn YOU rewards too!
              </li>
              <li>Friends Inviting Friends - Invitees of friends you've invited also help you earn.</li>
              <li>
                Refer-a-Friend-of-a-Friend-to-Mint - Friends of friends minting Worlds or Domains in the{' '}
                {this.link(this.explorerUrl, 'ZERO ID Explorer')} app earns you some trickle-up rewardonomics!
              </li>
            </ol>
          </div>
        ),
      },
      {
        title: 'This seems too good to be true?',
        content: (
          <div>
            <p>
              At ZERO, we believe a product cannot exist without the people who use it. By disbursing MEOW to our
              Messenger community, we're distributing the value of ZERO to those that bring it to life — you.
            </p>
            <p>
              Of course, we can't do this forever; early users of ZERO Messenger will be rewarded more than latecomers.
              As we scale into the future, individual payouts will diminish and we'll transition to a new model.
            </p>
          </div>
        ),
      },
      {
        title: 'What is MEOW?',
        content: (
          <>
            <div>
              <p>
                MEOW (ticker symbol $MEOW) is an ERC-20 standard cryptocurrency token on the Ethereum blockchain. It is
                the native currency of the ZERO ecosystem, powering a suite of native zApps, including our unique
                identity solution — ZERO ID — and our ZERO blockchain browser, {this.link(this.explorerUrl, 'Explorer')}
                . MEOW can be swapped for Ethereum or tradition fiat-backed currencies like USDC at major DeFi
                exchanges, like {this.link(this.uniswapUrl, 'Uniswap')}.
              </p>
              <p>MEOW is a used by a wider ecosystem of projects. Read more {this.link(this.meowUrl, 'here')}.</p>
            </div>
          </>
        ),
      },
      {
        title: 'What is ZERO ID?',
        content: (
          <>
            <div>
              <p>
                ZERO ID is the native identity management system powering the ZERO ecosystem. Everything in Messenger is
                tied to your ZERO ID; it is your digital passport and your key to unlocking the full potential of ZBI!
                ZERO ID comprises two type of domains, represented as ERC-721 NFTs on the Ethereum blockchain: Worlds
                and Domains. Worlds are the top-level domain in the system (0://hello) and are ideally suited for
                communities and organizations. Domains are second-level-and-beyond subdomains in the system, existing
                under Worlds (0://hello.goodbye), but also having the ability to mint domains under themselves
                (0://hello.goodbye.bonjour, 0://hello.goodbye.bonjour.adieu, and so on)!
              </p>
            </div>
          </>
        ),
      },
      {
        title: 'How can I withdraw my MEOW?',
        content: (
          <>
            <div>
              <p>The ability to withdraw your earned MEOW to an external wallet will be added soon!</p>
            </div>
          </>
        ),
      },
    ];
  }

  render() {
    return (
      <div {...cn('')}>
        <div {...cn('back')} onClick={this.back}>
          <IconArrowLeft size={16} /> FAQ
        </div>

        <div {...cn('content')}>
          <Accordion contrast='low' items={this.backupFAQContent} />
        </div>
      </div>
    );
  }
}
