import { ZAppManifest } from '../external-app/types/manifest';

export const AuraManifest: ZAppManifest = {
  title: 'AURA',
  route: '/aura',
  url: 'https://z-app-aura.vercel.app',
  features: [
    {
      type: 'fullscreen',
    },
    {
      type: 'microphone',
    },
  ],
};
