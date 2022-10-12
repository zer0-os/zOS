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

function getImageSource(app: Apps): string {
  return `https://res.cloudinary.com/fact0ry-dev/image/upload/v1649095368/zero-assets/zer0-os/apps/${app}.svg`;
}

const apps: { [apps: string]: PlatformApp } = {
  [Apps.Feed]: {
    type: Apps.Feed,
    name: 'Share',
    imageSource: getImageSource(Apps.Feed),
  },
  [Apps.NFTS]: {
    type: Apps.NFTS,
    name: 'Trade',
    imageSource: getImageSource(Apps.NFTS),
  },
  [Apps.DAOS]: {
    type: Apps.DAOS,
    name: 'Vote',
    imageSource: getImageSource(Apps.DAOS),
  },
  [Apps.Staking]: {
    type: Apps.Staking,
    name: 'Stake',
    imageSource: getImageSource(Apps.Staking),
  },
  [Apps.Channels]: {
    type: Apps.Channels,
    name: 'Chat',
    imageSource: getImageSource(Apps.Channels),
  },
  [Apps.Projects]: {
    type: Apps.Projects,
    name: 'Projects',
    imageSource: getImageSource(Apps.Projects),
  },
  [Apps.Members]: {
    type: Apps.Members,
    name: 'Members',
    imageSource: getImageSource(Apps.Members),
  },
};

const allApps = () => {
  const activeApps = [
    apps[Apps.Channels],
    apps[Apps.NFTS],
    apps[Apps.Feed],
    apps[Apps.DAOS],
    apps[Apps.Staking],
  ];

  return activeApps;
};

export { apps, allApps };
