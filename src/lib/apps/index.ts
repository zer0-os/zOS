export enum Apps {
  Feed = 'feed',
  NFTS = 'nfts',
  DAOS = 'daos',
  Staking = 'staking',
  Channels = 'channels',
  Projects = 'projects',
  Members = 'members',
}

export interface PlatformApp {
  type: Apps;
  name: string;
  imageSource: string;
}

const apps: { [apps: string]: PlatformApp } = {};

Object.keys(Apps).forEach((app) => {
  apps[Apps[app]] = {
    type: Apps[app],
    name: app,
    imageSource: `https://res.cloudinary.com/fact0ry-dev/image/upload/v1649095368/zero-assets/zer0-os/apps/${Apps[app]}.svg`,
  };
});

const allApps = () => {
  const activeApps = [
    apps[Apps.Feed],
    apps[Apps.NFTS],
    apps[Apps.Staking],
    apps[Apps.Channels],
    apps[Apps.DAOS],
  ];

  return activeApps;
};

export { apps, allApps };
