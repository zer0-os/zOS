import { Apps, apps, allApps } from '.';

describe('apps', () => {
  it('defaults to apps: Feed, NFTS, Staking, Channels, DAOS, BuyDomains', () => {
    expect(allApps()).toStrictEqual([
      apps[Apps.Feed],
      apps[Apps.NFTS],
      apps[Apps.Staking],
      apps[Apps.Channels],
      apps[Apps.DAOS],
      apps[Apps.BuyDomains],
    ]);
  });
});
