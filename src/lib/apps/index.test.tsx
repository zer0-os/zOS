import { Apps, apps, allApps } from '.';
import { featureFlags } from '../feature-flags';

jest.mock('../feature-flags');

describe('apps', () => {
  it('defaults to feed app', () => {
    expect(allApps()).toStrictEqual([
      apps[Apps.Feed],
    ]);
  });

  it('includes Channels when channelsApp feature flag is true', () => {
    featureFlags.channelsApp = true;

    expect(allApps()).toStrictEqual([
      apps[Apps.Feed],
      apps[Apps.Channels],
    ]);
  });
});
