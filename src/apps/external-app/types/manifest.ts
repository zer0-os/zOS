import { ZAppFeature } from './features';

/**
 * The manifest is a JSON object that describes the app.
 * It is used to provide information about the app to the zOS.
 */
type ZAppManifest = {
  title: string;
  route: `/${string}`;
  url: string;
  features: ZAppFeature[];
};

export type { ZAppManifest };
