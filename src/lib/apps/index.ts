export enum Apps {
  Channels = 'channels',
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
  [Apps.Channels]: {
    type: Apps.Channels,
    name: 'Chat',
    imageSource: getImageSource(Apps.Channels),
  },
};

export { apps };
