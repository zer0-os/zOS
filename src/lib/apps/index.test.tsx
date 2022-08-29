import { Apps, apps, allApps } from '.';

describe('apps', () => {
  it('defaults to feed, Channels app', () => {
    expect(allApps()).toStrictEqual([
      apps[Apps.Feed],
      apps[Apps.Channels],
    ]);
  });
});
