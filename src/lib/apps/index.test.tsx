import { Apps, apps, allApps } from '.';

describe('apps', () => {
  it('defaults to apps', () => {
    expect(allApps()).toStrictEqual([
      apps[Apps.Channels],
    ]);
  });
});
