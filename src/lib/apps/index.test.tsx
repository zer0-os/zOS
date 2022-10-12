import { Apps, apps, allApps } from '.';

describe('apps', () => {
  it('defaults to apps: Feed, NFTS, Staking, Channels, DAOS', () => {
    expect(allApps()).toStrictEqual([
      apps[Apps.Channels],
      apps[Apps.NFTS],
      apps[Apps.Feed],
      apps[Apps.DAOS],
      apps[Apps.Staking],
    ]);
  });
});
