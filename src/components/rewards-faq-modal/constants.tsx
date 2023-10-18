import * as React from 'react';

const link = (text: string, href: string) => (
  <a href={href} target='_blank' rel='noreferrer' style={{ color: '#01F4CB', textDecoration: 'underline' }}>
    {text}
  </a>
);

export const rewardsFaq = [
  {
    content:
      'A product does not exist without the people who use it. You — the user — are inherently valuable, as is the content you create, private or public. Big Tech social media recognizes that and exploits you for it, leaving you with nothing. At ZERO, we recognize the wealth of your content by rewarding you with $MEOW tokens. Your social interactions are valuable; you deserve to share that value.',
    title: 'Earning $MEOW for just chatting? What’s the catch? This seems too good to be true.',
  },
  {
    content: (
      <div>
        <div>
          $MEOW is a cryptocurrency token (
          {link('ERC-20', 'https://etherscan.io/token/0x0eC78ED49C2D27b315D462d43B5BAB94d2C79bf8')}) that is built on
          the Ethereum (ETH) blockchain. It is the native currency of the ZERO ecosystem where it powers our suite of
          native zApps, including our powerful domain ownership platform, ZNS (ZERO Naming System). $MEOW can also be
          swapped for fiat currencies (like the USD-backed $USDC) at major DeFI exchanges, like{' '}
          {link(
            'Uniswap',
            'https://app.uniswap.org/#/swap?outputCurrency=0x0ec78ed49c2d27b315d462d43b5bab94d2c79bf8&inputCurrency=ETH&use=V2'
          )}
          .
        </div>
        <br />
        <div>
          As a Web3 token, $MEOW also represents voting power within the ZERO network. Holding $MEOW allows you to vote
          to shape the future of the ZERO Messenger and broader ecosystem; holding more $MEOW gives you more voting
          power. If you’re interested viewing an early application of ZERO technology in action, check out the{' '}
          {link('Wilder World Metaverse', 'https://www.wilderworld.com/')} and DAO.
        </div>
      </div>
    ),
    title: 'So what is $MEOW?',
  },
  {
    content:
      'We don’t — not for now, at least. As an early adopter of ZERO tech, you are being rewarded simply for being here. Your participation and feedback are crucial to our goal of continual improvement of our zApps and ecosystem. Eventually, as we scale, the your individual rewards will diminish. Congrats on being early! The party’s just starting.',
    title: 'How does ZERO make money if the app is free AND I’m being paid?',
  },
  {
    content:
      'By chatting! In a DM, in a group, wherever, in-app. The more meaningful conversations you have with other users, the more rewards you’ll reap. Every 24 hours, or epoch, you will be awarded an appropriate amount of $MEOW derived from the previous day’s activities. The precise formula for determining how much you’ll make is ever-changing to combat botting and accommodate a growing user base.',
    title: 'How do I earn $MEOW tokens?',
  },
  {
    content:
      'The ability to withdraw your $MEOW to an external wallet will be introduced at a future date, to support the release of our ZNS (ZERO Naming System) domain functionality. Until then, sit tight and enjoy watching numba go up!',
    title: 'How can I withdraw/redeem my $MEOW?',
  },
];
