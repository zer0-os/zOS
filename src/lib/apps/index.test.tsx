import { Apps, apps, allApps } from '.';

describe('apps', () => {
  it('defaults to apps: Feed, Staking, Channels', () => {
    expect(allApps()).toStrictEqual([
      apps[Apps.Feed],
      apps[Apps.Staking],
      apps[Apps.Channels],
    ]);
  });
});
