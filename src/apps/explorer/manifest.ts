import { config } from '../../config';
import { ZAppManifest } from '../external-app/types/manifest';

export const ExplorerManifest: ZAppManifest = {
  title: 'Explorer',
  route: '/explorer',
  url: config.znsExplorerUrl || '',
  features: [],
};
